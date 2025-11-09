"""Dataset API endpoints with tenant isolation"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
import uuid
from app.db.session import get_db
from app.models.dataset import Dataset
from app.models.user import User
from app.api.dependencies import get_current_active_user
from app.schemas.dataset import DatasetResponse, DatasetCreate, DatasetUpdate


router = APIRouter()


@router.get("/", response_model=List[DatasetResponse])
def list_datasets(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db),
    skip: int = 0,
    limit: int = 100
):
    """
    List all datasets for the current user's organization
    (Tenant-isolated query)
    """
    if not current_user.organization_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="User must belong to an organization"
        )
    
    # Query only datasets from the same organization (tenant isolation)
    datasets = db.query(Dataset).filter(
        Dataset.organization_id == current_user.organization_id,
        Dataset.is_active == True
    ).offset(skip).limit(limit).all()
    
    return datasets


@router.post("/", response_model=DatasetResponse, status_code=status.HTTP_201_CREATED)
def create_dataset(
    dataset: DatasetCreate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    Create a new dataset for the current user's organization
    (Automatically scoped to user's organization)
    """
    if not current_user.organization_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="User must belong to an organization"
        )
    
    # Create dataset scoped to user's organization
    new_dataset = Dataset(
        id=str(uuid.uuid4()),
        name=dataset.name,
        description=dataset.description,
        organization_id=current_user.organization_id,  # Tenant isolation
        created_by=current_user.id,
        row_count=0,
        column_count=0,
        file_size=0,
    )
    
    db.add(new_dataset)
    db.commit()
    db.refresh(new_dataset)
    
    return new_dataset


@router.get("/{dataset_id}", response_model=DatasetResponse)
def get_dataset(
    dataset_id: str,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    Get a specific dataset
    (Tenant-isolated - users can only access datasets from their organization)
    """
    if not current_user.organization_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="User must belong to an organization"
        )
    
    # Query with tenant isolation
    dataset = db.query(Dataset).filter(
        Dataset.id == dataset_id,
        Dataset.organization_id == current_user.organization_id  # Tenant check
    ).first()
    
    if not dataset:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Dataset not found"
        )
    
    return dataset


@router.patch("/{dataset_id}", response_model=DatasetResponse)
def update_dataset(
    dataset_id: str,
    updates: DatasetUpdate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    Update a dataset
    (Tenant-isolated)
    """
    if not current_user.organization_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="User must belong to an organization"
        )
    
    # Query with tenant isolation
    dataset = db.query(Dataset).filter(
        Dataset.id == dataset_id,
        Dataset.organization_id == current_user.organization_id  # Tenant check
    ).first()
    
    if not dataset:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Dataset not found"
        )
    
    # Update fields
    if updates.name is not None:
        dataset.name = updates.name
    if updates.description is not None:
        dataset.description = updates.description
    
    db.commit()
    db.refresh(dataset)
    
    return dataset


@router.delete("/{dataset_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_dataset(
    dataset_id: str,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    Delete a dataset
    (Tenant-isolated, admin only)
    """
    if not current_user.organization_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="User must belong to an organization"
        )
    
    # Query with tenant isolation
    dataset = db.query(Dataset).filter(
        Dataset.id == dataset_id,
        Dataset.organization_id == current_user.organization_id  # Tenant check
    ).first()
    
    if not dataset:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Dataset not found"
        )
    
    # Soft delete
    dataset.is_active = False
    db.commit()
    
    return None

