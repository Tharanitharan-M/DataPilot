"""Clerk authentication utilities"""

import jwt
import requests
from typing import Optional, Dict, Any
from fastapi import HTTPException, status
from functools import lru_cache
from app.core.config import settings


class ClerkJWTVerifier:
    """Verify Clerk JWT tokens"""
    
    def __init__(self):
        self.jwks_url = f"https://{settings.CLERK_DOMAIN}/.well-known/jwks.json"
        self._jwks_cache: Optional[Dict] = None
    
    @lru_cache(maxsize=1)
    def get_jwks(self) -> Dict:
        """Fetch JWKS from Clerk (cached)"""
        try:
            response = requests.get(self.jwks_url, timeout=10)
            response.raise_for_status()
            return response.json()
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Failed to fetch JWKS: {str(e)}"
            )
    
    def get_signing_key(self, token: str) -> str:
        """Get the signing key for the token"""
        try:
            # Decode header without verification to get kid
            header = jwt.get_unverified_header(token)
            kid = header.get("kid")
            
            if not kid:
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Token missing kid in header"
                )
            
            # Get JWKS
            jwks = self.get_jwks()
            
            # Find matching key
            for key in jwks.get("keys", []):
                if key.get("kid") == kid:
                    # Construct PEM format public key
                    return jwt.algorithms.RSAAlgorithm.from_jwk(key)
            
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Unable to find matching signing key"
            )
            
        except HTTPException:
            raise
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail=f"Error getting signing key: {str(e)}"
            )
    
    def verify_token(self, token: str) -> Dict[str, Any]:
        """
        Verify Clerk JWT token and return payload
        
        Args:
            token: JWT token from Clerk
            
        Returns:
            Decoded token payload with user info
            
        Raises:
            HTTPException: If token is invalid
        """
        try:
            # Get signing key
            signing_key = self.get_signing_key(token)
            
            # Verify and decode token
            payload = jwt.decode(
                token,
                signing_key,
                algorithms=["RS256"],
                audience=None,  # Clerk doesn't use aud claim by default
                options={
                    "verify_signature": True,
                    "verify_exp": True,
                    "verify_iat": True,
                }
            )
            
            return payload
            
        except jwt.ExpiredSignatureError:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Token has expired"
            )
        except jwt.InvalidTokenError as e:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail=f"Invalid token: {str(e)}"
            )
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail=f"Token verification failed: {str(e)}"
            )


# Global verifier instance
clerk_verifier = ClerkJWTVerifier()


def verify_clerk_token(token: str) -> Dict[str, Any]:
    """
    Verify a Clerk token and return the payload
    
    Usage:
        payload = verify_clerk_token(token)
        user_id = payload.get("sub")
        org_id = payload.get("org_id")
    """
    return clerk_verifier.verify_token(token)

