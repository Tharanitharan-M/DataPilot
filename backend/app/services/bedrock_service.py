"""
AWS Bedrock service for natural language to SQL conversion
Using Claude 3 Sonnet with proper guardrails and error handling
"""

import boto3
import json
import time
from typing import Dict, Any, Optional, List
from botocore.exceptions import ClientError

from app.core.config import settings
from app.utils.logger import logger


class BedrockService:
    """Service for interacting with AWS Bedrock LLM"""
    
    def __init__(self):
        """Initialize Bedrock client"""
        try:
            self.client = boto3.client(
                service_name='bedrock-runtime',
                region_name=settings.AWS_REGION,
                aws_access_key_id=settings.AWS_ACCESS_KEY_ID,
                aws_secret_access_key=settings.AWS_SECRET_ACCESS_KEY,
            )
            
            # Model configuration
            self.model_id = settings.BEDROCK_MODEL_ID
            self.max_tokens = settings.BEDROCK_MAX_TOKENS
            self.temperature = settings.BEDROCK_TEMPERATURE
            
            logger.info(f"Bedrock service initialized with model: {self.model_id}")
            
        except Exception as e:
            logger.error(f"Failed to initialize Bedrock client: {str(e)}")
            raise
    
    def _create_system_prompt(self) -> str:
        """Create system prompt with guardrails and guidelines"""
        return """You are a SQL expert assistant that converts natural language questions into PostgreSQL queries.

STRICT RULES:
1. ONLY generate valid PostgreSQL SELECT queries
2. NEVER generate INSERT, UPDATE, DELETE, DROP, TRUNCATE, or ALTER statements
3. ALWAYS use proper SQL syntax with table and column names from the provided schema
4. Include appropriate WHERE clauses, JOINs, and aggregations as needed
5. Use LIMIT clauses to prevent returning too many rows (default LIMIT 100)
6. Handle NULL values appropriately
7. Use proper data type casting when needed
8. Return ONLY the SQL query without explanations or markdown formatting
9. If the question cannot be answered with the given schema, respond with: "SCHEMA_ERROR: [explanation]"
10. If the question is ambiguous, make reasonable assumptions and add a comment explaining them

SECURITY GUARDRAILS:
- No destructive operations (DELETE, DROP, TRUNCATE)
- No data modification (INSERT, UPDATE)
- No schema changes (ALTER, CREATE)
- No system queries (pg_catalog access except for metadata)
- Always validate table and column names exist in schema
- Use parameterized queries patterns where applicable
- Add LIMIT to prevent resource exhaustion

OUTPUT FORMAT:
Return ONLY the SQL query as plain text. No markdown, no code blocks, no explanations.
"""
    
    def _create_user_prompt(
        self,
        natural_language_query: str,
        schema_info: Dict[str, Any],
        query_context: Optional[str] = None,
    ) -> str:
        """Create user prompt with schema context"""
        
        # Format schema information
        schema_text = "DATABASE SCHEMA:\n\n"
        
        if "tables" in schema_info:
            for table_name, table_info in schema_info["tables"].items():
                schema_text += f"Table: {table_name}\n"
                schema_text += "Columns:\n"
                
                for column in table_info.get("columns", []):
                    col_name = column.get("name", "")
                    col_type = column.get("data_type", column.get("type", ""))
                    schema_text += f"  - {col_name} ({col_type})\n"
                
                schema_text += "\n"
        
        # Add sample data if available
        if query_context:
            schema_text += f"\nADDITIONAL CONTEXT:\n{query_context}\n\n"
        
        prompt = f"""{schema_text}
USER QUESTION:
{natural_language_query}

Generate a PostgreSQL query to answer this question. Remember:
- Use ONLY tables and columns from the schema above
- Return ONLY the SQL query
- Add LIMIT clause to prevent large result sets
- Use proper SQL syntax
"""
        
        return prompt
    
    def _validate_sql_safety(self, sql_query: str) -> tuple[bool, Optional[str]]:
        """
        Validate that the generated SQL is safe to execute
        Returns (is_safe, error_message)
        """
        sql_upper = sql_query.upper().strip()
        
        # Check for dangerous operations
        dangerous_keywords = [
            'DELETE', 'DROP', 'TRUNCATE', 'ALTER', 'CREATE',
            'INSERT', 'UPDATE', 'GRANT', 'REVOKE', 'EXECUTE',
            'EXEC', 'PRAGMA', '--', '/*', '*/', ';DELETE', ';DROP',
        ]
        
        for keyword in dangerous_keywords:
            if keyword in sql_upper:
                return False, f"Dangerous operation detected: {keyword}"
        
        # Must start with SELECT
        if not sql_upper.startswith('SELECT') and not sql_upper.startswith('WITH'):
            return False, "Query must start with SELECT or WITH"
        
        # Check for multiple statements (SQL injection attempt)
        if sql_upper.count(';') > 1:
            return False, "Multiple SQL statements not allowed"
        
        # Remove trailing semicolon for single statement
        if sql_upper.endswith(';'):
            sql_query = sql_query.rstrip(';')
        
        return True, None
    
    def generate_sql(
        self,
        natural_language_query: str,
        schema_info: Dict[str, Any],
        query_context: Optional[str] = None,
    ) -> Dict[str, Any]:
        """
        Generate SQL query from natural language using AWS Bedrock
        
        Args:
            natural_language_query: The user's question in natural language
            schema_info: Database schema information
            query_context: Optional additional context about the data
        
        Returns:
            Dictionary with 'success', 'sql_query', 'error', 'execution_time_ms'
        """
        start_time = time.time()
        
        try:
            # Validate inputs
            if not natural_language_query or not natural_language_query.strip():
                return {
                    "success": False,
                    "error": "Natural language query is required",
                    "execution_time_ms": 0,
                }
            
            if not schema_info or not schema_info.get("tables"):
                return {
                    "success": False,
                    "error": "Database schema information is required",
                    "execution_time_ms": 0,
                }
            
            # Create prompts
            system_prompt = self._create_system_prompt()
            user_prompt = self._create_user_prompt(
                natural_language_query,
                schema_info,
                query_context
            )
            
            logger.info(f"Generating SQL for query: {natural_language_query[:100]}")
            
            # Prepare request body for Claude 3 Sonnet
            request_body = {
                "anthropic_version": "bedrock-2023-05-31",
                "max_tokens": self.max_tokens,
                "temperature": self.temperature,
                "system": system_prompt,
                "messages": [
                    {
                        "role": "user",
                        "content": user_prompt
                    }
                ]
            }
            
            # Call Bedrock API
            response = self.client.invoke_model(
                modelId=self.model_id,
                body=json.dumps(request_body),
                contentType="application/json",
                accept="application/json"
            )
            
            # Parse response
            response_body = json.loads(response['body'].read())
            
            # Extract SQL query from response
            sql_query = response_body['content'][0]['text'].strip()
            
            # Clean up the SQL query
            sql_query = sql_query.replace('```sql', '').replace('```', '').strip()
            
            # Check for schema errors
            if sql_query.startswith("SCHEMA_ERROR:"):
                return {
                    "success": False,
                    "error": sql_query.replace("SCHEMA_ERROR:", "").strip(),
                    "execution_time_ms": int((time.time() - start_time) * 1000),
                }
            
            # Validate SQL safety
            is_safe, safety_error = self._validate_sql_safety(sql_query)
            
            if not is_safe:
                logger.error(f"Unsafe SQL detected: {safety_error}")
                return {
                    "success": False,
                    "error": f"Safety validation failed: {safety_error}",
                    "sql_query": sql_query,
                    "execution_time_ms": int((time.time() - start_time) * 1000),
                }
            
            execution_time = int((time.time() - start_time) * 1000)
            
            logger.info(f"SQL generated successfully in {execution_time}ms")
            
            return {
                "success": True,
                "sql_query": sql_query,
                "model_id": self.model_id,
                "execution_time_ms": execution_time,
                "input_tokens": response_body.get('usage', {}).get('input_tokens', 0),
                "output_tokens": response_body.get('usage', {}).get('output_tokens', 0),
            }
            
        except ClientError as e:
            error_code = e.response.get('Error', {}).get('Code', 'Unknown')
            error_message = e.response.get('Error', {}).get('Message', str(e))
            
            logger.error(f"Bedrock API error ({error_code}): {error_message}")
            
            return {
                "success": False,
                "error": f"AWS Bedrock error: {error_message}",
                "error_code": error_code,
                "execution_time_ms": int((time.time() - start_time) * 1000),
            }
            
        except Exception as e:
            logger.error(f"Unexpected error generating SQL: {str(e)}")
            
            return {
                "success": False,
                "error": f"Failed to generate SQL: {str(e)}",
                "execution_time_ms": int((time.time() - start_time) * 1000),
            }
    
    def improve_sql_query(
        self,
        original_query: str,
        schema_info: Dict[str, Any],
        improvement_request: str,
    ) -> Dict[str, Any]:
        """
        Improve or modify an existing SQL query based on user feedback
        """
        prompt = f"""Given this SQL query:
{original_query}

And this database schema:
{json.dumps(schema_info, indent=2)}

Please modify the query to: {improvement_request}

Return ONLY the improved SQL query.
"""
        
        return self.generate_sql(prompt, schema_info)
    
    def explain_sql_query(self, sql_query: str) -> Dict[str, Any]:
        """
        Generate a natural language explanation of a SQL query
        """
        start_time = time.time()
        
        try:
            system_prompt = "You are a SQL expert that explains queries in simple, clear language."
            
            user_prompt = f"""Explain this SQL query in simple terms:

{sql_query}

Provide a clear, concise explanation of what this query does.
"""
            
            request_body = {
                "anthropic_version": "bedrock-2023-05-31",
                "max_tokens": 500,
                "temperature": 0.3,
                "system": system_prompt,
                "messages": [
                    {
                        "role": "user",
                        "content": user_prompt
                    }
                ]
            }
            
            response = self.client.invoke_model(
                modelId=self.model_id,
                body=json.dumps(request_body),
                contentType="application/json",
                accept="application/json"
            )
            
            response_body = json.loads(response['body'].read())
            explanation = response_body['content'][0]['text'].strip()
            
            return {
                "success": True,
                "explanation": explanation,
                "execution_time_ms": int((time.time() - start_time) * 1000),
            }
            
        except Exception as e:
            logger.error(f"Error explaining SQL: {str(e)}")
            return {
                "success": False,
                "error": str(e),
                "execution_time_ms": int((time.time() - start_time) * 1000),
            }


# Singleton instance
_bedrock_service: Optional[BedrockService] = None


def get_bedrock_service() -> BedrockService:
    """Get or create Bedrock service instance"""
    global _bedrock_service
    
    if _bedrock_service is None:
        _bedrock_service = BedrockService()
    
    return _bedrock_service

