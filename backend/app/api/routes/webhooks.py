"""Clerk webhook handlers"""

from fastapi import APIRouter, Request, HTTPException, status, Depends
from sqlalchemy.orm import Session
from svix.webhooks import Webhook, WebhookVerificationError
from app.core.config import settings
from app.db.session import get_db
from app.services.clerk_sync import ClerkSyncService
from app.utils.logger import logger


router = APIRouter()


@router.post("/clerk")
async def clerk_webhook(
    request: Request,
    db: Session = Depends(get_db)
):
    """
    Handle Clerk webhooks
    
    Supported events:
    - user.created
    - user.updated
    - user.deleted
    - organization.created
    - organization.updated
    - organization.deleted
    - organizationMembership.created
    - organizationMembership.deleted
    """
    try:
        # Get webhook payload and headers
        payload = await request.body()
        headers = request.headers
        
        # Verify webhook signature (if webhook secret is configured)
        if settings.CLERK_WEBHOOK_SECRET:
            try:
                wh = Webhook(settings.CLERK_WEBHOOK_SECRET)
                event = wh.verify(payload, headers)
            except WebhookVerificationError as e:
                logger.error(f"Webhook verification failed: {str(e)}")
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Invalid webhook signature"
                )
        else:
            # If no secret configured, parse payload directly (not recommended for production)
            import json
            event = json.loads(payload)
            logger.warning("Webhook signature verification skipped - CLERK_WEBHOOK_SECRET not configured")
        
        # Get event type and data
        event_type = event.get("type")
        event_data = event.get("data")
        
        logger.info(f"Received webhook: {event_type}")
        
        # Route to appropriate handler
        if event_type == "user.created":
            ClerkSyncService.sync_user_created(event_data, db)
            
        elif event_type == "user.updated":
            ClerkSyncService.sync_user_updated(event_data, db)
            
        elif event_type == "user.deleted":
            ClerkSyncService.sync_user_deleted(event_data, db)
            
        elif event_type == "organization.created":
            ClerkSyncService.sync_organization_created(event_data, db)
            
        elif event_type == "organization.updated":
            ClerkSyncService.sync_organization_updated(event_data, db)
            
        elif event_type == "organization.deleted":
            ClerkSyncService.sync_organization_deleted(event_data, db)
            
        elif event_type == "organizationMembership.created":
            ClerkSyncService.sync_organization_membership_created(event_data, db)
            
        elif event_type == "organizationMembership.deleted":
            ClerkSyncService.sync_organization_membership_deleted(event_data, db)
            
        elif event_type == "organizationMembership.updated":
            # Handle role changes
            ClerkSyncService.sync_organization_membership_created(event_data, db)
            
        else:
            logger.info(f"Unhandled webhook event: {event_type}")
        
        return {"status": "success", "event": event_type}
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error processing webhook: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Webhook processing failed: {str(e)}"
        )

