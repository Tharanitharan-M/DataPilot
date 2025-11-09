"""Service for syncing Clerk data to database"""

import json
from typing import Dict, Any, Optional
from sqlalchemy.orm import Session
from app.models.user import User
from app.models.organization import Organization
from app.utils.logger import logger


class ClerkSyncService:
    """Service to sync Clerk webhooks to database"""
    
    @staticmethod
    def sync_user_created(data: Dict[str, Any], db: Session) -> User:
        """
        Sync user.created webhook
        
        Args:
            data: Webhook payload from Clerk
            db: Database session
            
        Returns:
            Created User object
        """
        try:
            user_id = data.get("id")
            email_addresses = data.get("email_addresses", [])
            primary_email = next(
                (e["email_address"] for e in email_addresses if e.get("id") == data.get("primary_email_address_id")),
                None
            ) or (email_addresses[0]["email_address"] if email_addresses else None)
            
            if not user_id or not primary_email:
                raise ValueError("Missing required user data")
            
            # Check if user already exists
            existing_user = db.query(User).filter(User.id == user_id).first()
            if existing_user:
                logger.info(f"User {user_id} already exists, updating...")
                return ClerkSyncService.sync_user_updated(data, db)
            
            # Create new user
            user = User(
                id=user_id,
                email=primary_email,
                first_name=data.get("first_name"),
                last_name=data.get("last_name"),
                image_url=data.get("image_url"),
                username=data.get("username"),
                email_verified=any(e.get("verification", {}).get("status") == "verified" for e in email_addresses),
                public_metadata=json.dumps(data.get("public_metadata", {})),
                private_metadata=json.dumps(data.get("private_metadata", {})),
                clerk_created_at=str(data.get("created_at")),
                clerk_updated_at=str(data.get("updated_at")),
            )
            
            db.add(user)
            db.commit()
            db.refresh(user)
            
            logger.info(f"User created: {user_id} ({primary_email})")
            return user
            
        except Exception as e:
            db.rollback()
            logger.error(f"Error syncing user.created: {str(e)}")
            raise
    
    @staticmethod
    def sync_user_updated(data: Dict[str, Any], db: Session) -> User:
        """
        Sync user.updated webhook
        
        Args:
            data: Webhook payload from Clerk
            db: Database session
            
        Returns:
            Updated User object
        """
        try:
            user_id = data.get("id")
            user = db.query(User).filter(User.id == user_id).first()
            
            if not user:
                logger.warning(f"User {user_id} not found, creating...")
                return ClerkSyncService.sync_user_created(data, db)
            
            # Update user fields
            email_addresses = data.get("email_addresses", [])
            primary_email = next(
                (e["email_address"] for e in email_addresses if e.get("id") == data.get("primary_email_address_id")),
                None
            ) or (email_addresses[0]["email_address"] if email_addresses else user.email)
            
            user.email = primary_email
            user.first_name = data.get("first_name")
            user.last_name = data.get("last_name")
            user.image_url = data.get("image_url")
            user.username = data.get("username")
            user.email_verified = any(e.get("verification", {}).get("status") == "verified" for e in email_addresses)
            user.public_metadata = json.dumps(data.get("public_metadata", {}))
            user.private_metadata = json.dumps(data.get("private_metadata", {}))
            user.clerk_updated_at = str(data.get("updated_at"))
            
            db.commit()
            db.refresh(user)
            
            logger.info(f"User updated: {user_id}")
            return user
            
        except Exception as e:
            db.rollback()
            logger.error(f"Error syncing user.updated: {str(e)}")
            raise
    
    @staticmethod
    def sync_user_deleted(data: Dict[str, Any], db: Session) -> bool:
        """
        Sync user.deleted webhook
        
        Args:
            data: Webhook payload from Clerk
            db: Database session
            
        Returns:
            True if successful
        """
        try:
            user_id = data.get("id")
            user = db.query(User).filter(User.id == user_id).first()
            
            if user:
                db.delete(user)
                db.commit()
                logger.info(f"User deleted: {user_id}")
            else:
                logger.warning(f"User {user_id} not found for deletion")
            
            return True
            
        except Exception as e:
            db.rollback()
            logger.error(f"Error syncing user.deleted: {str(e)}")
            raise
    
    @staticmethod
    def sync_organization_created(data: Dict[str, Any], db: Session) -> Organization:
        """
        Sync organization.created webhook
        
        Args:
            data: Webhook payload from Clerk
            db: Database session
            
        Returns:
            Created Organization object
        """
        try:
            org_id = data.get("id")
            name = data.get("name")
            slug = data.get("slug")
            
            if not org_id or not name or not slug:
                raise ValueError("Missing required organization data")
            
            # Check if org already exists
            existing_org = db.query(Organization).filter(Organization.id == org_id).first()
            if existing_org:
                logger.info(f"Organization {org_id} already exists, updating...")
                return ClerkSyncService.sync_organization_updated(data, db)
            
            # Create new organization
            org = Organization(
                id=org_id,
                name=name,
                slug=slug,
                image_url=data.get("image_url"),
                public_metadata=json.dumps(data.get("public_metadata", {})),
                private_metadata=json.dumps(data.get("private_metadata", {})),
                max_members=data.get("max_allowed_memberships", 10),
                clerk_created_at=str(data.get("created_at")),
                clerk_updated_at=str(data.get("updated_at")),
            )
            
            db.add(org)
            db.commit()
            db.refresh(org)
            
            logger.info(f"Organization created: {org_id} ({name})")
            return org
            
        except Exception as e:
            db.rollback()
            logger.error(f"Error syncing organization.created: {str(e)}")
            raise
    
    @staticmethod
    def sync_organization_updated(data: Dict[str, Any], db: Session) -> Organization:
        """
        Sync organization.updated webhook
        
        Args:
            data: Webhook payload from Clerk
            db: Database session
            
        Returns:
            Updated Organization object
        """
        try:
            org_id = data.get("id")
            org = db.query(Organization).filter(Organization.id == org_id).first()
            
            if not org:
                logger.warning(f"Organization {org_id} not found, creating...")
                return ClerkSyncService.sync_organization_created(data, db)
            
            # Update organization fields
            org.name = data.get("name", org.name)
            org.slug = data.get("slug", org.slug)
            org.image_url = data.get("image_url")
            org.public_metadata = json.dumps(data.get("public_metadata", {}))
            org.private_metadata = json.dumps(data.get("private_metadata", {}))
            org.max_members = data.get("max_allowed_memberships", org.max_members)
            org.clerk_updated_at = str(data.get("updated_at"))
            
            db.commit()
            db.refresh(org)
            
            logger.info(f"Organization updated: {org_id}")
            return org
            
        except Exception as e:
            db.rollback()
            logger.error(f"Error syncing organization.updated: {str(e)}")
            raise
    
    @staticmethod
    def sync_organization_deleted(data: Dict[str, Any], db: Session) -> bool:
        """
        Sync organization.deleted webhook
        
        Args:
            data: Webhook payload from Clerk
            db: Database session
            
        Returns:
            True if successful
        """
        try:
            org_id = data.get("id")
            org = db.query(Organization).filter(Organization.id == org_id).first()
            
            if org:
                db.delete(org)
                db.commit()
                logger.info(f"Organization deleted: {org_id}")
            else:
                logger.warning(f"Organization {org_id} not found for deletion")
            
            return True
            
        except Exception as e:
            db.rollback()
            logger.error(f"Error syncing organization.deleted: {str(e)}")
            raise
    
    @staticmethod
    def sync_organization_membership_created(data: Dict[str, Any], db: Session) -> bool:
        """
        Sync organizationMembership.created webhook
        Links user to organization
        
        Args:
            data: Webhook payload from Clerk
            db: Database session
            
        Returns:
            True if successful
        """
        try:
            org_id = data.get("organization", {}).get("id")
            user_id = data.get("public_user_data", {}).get("user_id")
            role = data.get("role", "member")
            
            if not org_id or not user_id:
                raise ValueError("Missing required membership data")
            
            # Update user's organization
            user = db.query(User).filter(User.id == user_id).first()
            if user:
                user.organization_id = org_id
                user.role = role
                db.commit()
                logger.info(f"User {user_id} added to organization {org_id} as {role}")
            else:
                logger.warning(f"User {user_id} not found for membership update")
            
            return True
            
        except Exception as e:
            db.rollback()
            logger.error(f"Error syncing organizationMembership.created: {str(e)}")
            raise
    
    @staticmethod
    def sync_organization_membership_deleted(data: Dict[str, Any], db: Session) -> bool:
        """
        Sync organizationMembership.deleted webhook
        Removes user from organization
        
        Args:
            data: Webhook payload from Clerk
            db: Database session
            
        Returns:
            True if successful
        """
        try:
            user_id = data.get("public_user_data", {}).get("user_id")
            
            if not user_id:
                raise ValueError("Missing user_id in membership data")
            
            # Remove user's organization
            user = db.query(User).filter(User.id == user_id).first()
            if user:
                user.organization_id = None
                user.role = "member"
                db.commit()
                logger.info(f"User {user_id} removed from organization")
            else:
                logger.warning(f"User {user_id} not found for membership removal")
            
            return True
            
        except Exception as e:
            db.rollback()
            logger.error(f"Error syncing organizationMembership.deleted: {str(e)}")
            raise

