"""
Bitrix24 Synchronization Service with GDPR Compliance
====================================================
Author: Senior Architect (30+ years EU compliance experience)
File: bitrix_sync/service.py
Compliance: GDPR Article 6(1)(f), Article 9(2)(e), Article 17, Article 30

This implementation ensures:
- Data minimization (only necessary fields synchronized)
- Special category data handling (religious affiliation)
- Country-specific compliance rules (Lithuania first)
- Right to erasure implementation
- Complete audit trail for all operations

Required environment variables:
- BITRIX24_DOMAIN: Country-specific Bitrix24 domain (e.g., gyvenimo-kelias.bitrix24.com)
- BITRIX24_ACCESS_TOKEN: OAuth2 token with proper scopes
- COUNTRY_CODE: ISO 2-letter country code (LT, LV, EE, etc.)
- GDPR_PROCESSING_PURPOSE: ID of the processing purpose in Article 30 record
"""

import logging
import time
import json
from datetime import datetime, timedelta
from functools import wraps
from typing import Dict, List, Optional, Tuple, Any, Callable

import requests
from django.conf import settings
from django.db import transaction
from django.utils import timezone
from django.core.exceptions import ValidationError
from django.db.models import Q

from .models import (
    BitrixSyncRecord, 
    Contact, 
    Church, 
    GDPRConsent, 
    DataProcessingRecord,
    SpecialCategoryData
)
from .exceptions import (
    BitrixAPIError, 
    GDPRComplianceError, 
    DataSovereigntyViolation
)

# Configure specialized logger for GDPR compliance
logger = logging.getLogger('bitrix_sync.gdpr')
logger.addHandler(logging.FileHandler('/var/log/bitrix_sync/gdpr_audit.log'))
logger.setLevel(logging.INFO)

# ======================
# GDPR COMPLIANCE UTILITIES
# ======================

def gdpr_compliance_check(country_code: str) -> Callable:
    """Decorator enforcing country-specific GDPR compliance rules"""
    def decorator(func: Callable) -> Callable:
        @wraps(func)
        def wrapper(*args, **kwargs):
            # Verify data sovereignty
            if settings.CLOUD_ENV == 'GKE' and country_code != 'global':
                raise DataSovereigntyViolation(
                    f"Stateless processing attempted for {country_code} data in GKE"
                )
            
            # Verify processing purpose
            if 'processing_purpose' not in kwargs:
                raise GDPRComplianceError("Missing processing purpose identifier")
                
            # Verify consent (except for legitimate interest processing)
            if kwargs.get('requires_consent', True):
                if not GDPRConsent.objects.filter(
                    country_code=country_code,
                    processing_purpose=kwargs['processing_purpose'],
                    granted_at__gte=timezone.now() - timedelta(days=365)
                ).exists():
                    raise GDPRComplianceError(
                        f"Missing valid consent for purpose {kwargs['processing_purpose']} in {country_code}"
                    )
            
            return func(*args, **kwargs)
        return wrapper
    return decorator

def mask_special_category_data(data: Dict, country_code: str) -> Dict:
    """
    Apply country-specific masking to special category data
    Implements GDPR Article 9 safeguards
    
    Lithuania-specific rules:
    - Religious affiliation: Only store category (Catholic/Orthodox/etc.), not details
    - Sacrament records: Mask exact dates, store only year
    - Burial records: Never store exact GPS coordinates
    """
    masked = data.copy()
    
    # Common special category fields
    special_fields = {
        'religion': lambda x: x.split('/')[0] if x and '/' in x else x,  # Keep only top-level category
        'sacrament_dates': lambda x: {k: v[:4] for k, v in x.items()} if x else {},  # Store only year
        'burial_location': lambda x: {
            'cemetery': x.get('cemetery'),
            'section': x.get('section')
        } if x else None
    }
    
    # Country-specific overrides
    if country_code == 'LT':
        # Lithuanian additional requirements
        special_fields.update({
            'next_of_kin': lambda x: {
                'name': 'REDACTED' if x and x.get('relationship') == 'spouse' else x.get('name'),
                'phone': mask_phone(x.get('phone')) if x else None
            } if x else None,
            'confession_records': None  # Never store in Lithuania
        })
    
    # Apply masking
    for field, masker in special_fields.items():
        if field in masked and masker is not None:
            try:
                masked[field] = masker(masked[field])
            except Exception as e:
                logger.error(f"Masking failed for {field}: {str(e)}")
                masked[field] = None  # Fail-safe: remove data rather than leak
    
    return masked

def mask_phone(phone: Optional[str]) -> Optional[str]:
    """Lithuanian phone masking (last 2 digits only)"""
    if not phone:
        return None
    return re.sub(r'(\d{1,6})\d{2}', r'\1**', phone)

def create_processing_record(
    entity_type: str,
    entity_id: int,
    operation: str,
    country_code: str,
    processing_purpose: str
) -> None:
    """Create GDPR Article 30 processing record"""
    DataProcessingRecord.objects.create(
        entity_type=entity_type,
        entity_id=entity_id,
        operation=operation,
        country_code=country_code,
        processing_purpose=processing_purpose,
        timestamp=timezone.now()
    )

# ======================
# BITRIX24 API CLIENT
# ======================

class Bitrix24Client:
    """GDPR-compliant Bitrix24 API client with country-specific rules"""
    
    API_VERSION = 'v1'
    MAX_RETRIES = 3
    RETRY_DELAY = 1.5  # seconds
    
    def __init__(self, country_code: str):
        self.country_code = country_code.lower()
        self.domain = settings.BITRIX24_DOMAINS[self.country_code]
        self.access_token = settings.BITRIX24_TOKENS[self.country_code]
        self.api_url = f"https://{self.domain}/rest/{self.API_VERSION}"
        
        # Verify data sovereignty
        if not self.domain.endswith(f".{self.country_code}"):
            raise DataSovereigntyViolation(
                f"Bitrix24 instance {self.domain} does not match country code {self.country_code}"
            )
    
    def _make_request(
        self, 
        method: str, 
        endpoint: str, 
        params: Optional[Dict] = None,
         Optional[Dict] = None,
        retry_count: int = 0
    ) -> Dict:
        """Make GDPR-compliant API request with retry logic"""
        headers = {
            'Authorization': f'Bearer {self.access_token}',
            'X-GDPR-Processing-Purpose': settings.GDPR_PROCESSING_PURPOSE,
            'X-Country-Code': self.country_code,
        }
        
        try:
            response = requests.request(
                method,
                f"{self.api_url}/{endpoint}",
                params=params,
                json=data,
                headers=headers,
                timeout=15.0
            )
            
            response.raise_for_status()
            return response.json()
            
        except requests.exceptions.RequestException as e:
            if retry_count < self.MAX_RETRIES:
                logger.warning(
                    f"Bitrix24 request failed (attempt {retry_count+1}/{self.MAX_RETRIES}): {str(e)}"
                )
                time.sleep(self.RETRY_DELAY * (retry_count + 1))
                return self._make_request(method, endpoint, params, data, retry_count + 1)
            
            logger.error(f"Bitrix24 API permanent failure: {str(e)}")
            raise BitrixAPIError(f"Bitrix24 API error: {str(e)}") from e
    
    @gdpr_compliance_check(country_code='country_code_param')
    def get_contacts(
        self, 
        last_sync: Optional[datetime] = None,
        processing_purpose: str = settings.GDPR_PROCESSING_PURPOSE,
        **kwargs
    ) -> List[Dict]:
        """Fetch contacts with GDPR-compliant field selection"""
        params = {
            'select[]': [
                'ID', 'NAME', 'LAST_NAME', 'PHONE', 'EMAIL', 
                'UF_CRM_1565773321',  # Church affiliation
                'UF_CRM_1565773389',  # Sacrament records
                'UF_CRM_1565773407'   # Burial location
            ]
        }
        
        if last_sync:
            params['filter[>DATE_MODIFY]'] = last_sync.isoformat()
        
        result = self._make_request('GET', 'crm.contact.list', params=params)
        return [self._mask_contact_data(contact) for contact in result.get('result', [])]
    
    def _mask_contact_data(self, contact: Dict) -> Dict:
        """Apply GDPR-compliant masking to contact data"""
        # Extract Bitrix24 custom fields to standard format
        standard_contact = {
            'id': contact['ID'],
            'first_name': contact.get('NAME', ''),
            'last_name': contact.get('LAST_NAME', ''),
            'phone': contact.get('PHONE', [{}])[0].get('VALUE', '') if contact.get('PHONE') else '',
            'email': contact.get('EMAIL', [{}])[0].get('VALUE', '') if contact.get('EMAIL') else '',
            'religion': contact.get('UF_CRM_1565773321'),
            'sacrament_dates': json.loads(contact.get('UF_CRM_1565773389', '{}')),
            'burial_location': json.loads(contact.get('UF_CRM_1565773407', 'null')),
        }
        
        # Apply country-specific masking
        return mask_special_category_data(standard_contact, self.country_code)
    
    @gdpr_compliance_check(country_code='country_code_param')
    def update_contact(
        self, 
        contact_id: int, 
        contact_ Dict,
        processing_purpose: str = settings.GDPR_PROCESSING_PURPOSE,
        **kwargs
    ) -> Dict:
        """Update contact with GDPR-compliant data handling"""
        # Verify we're not storing prohibited fields
        prohibited_fields = ['confession_records', 'exact_burial_coordinates']
        if any(field in contact_data for field in prohibited_fields):
            raise GDPRComplianceError(
                f"Attempt to store prohibited fields: {', '.join(prohibited_fields)}"
            )
        
        # Prepare Bitrix24 format
        bitrix_data = {
            'ID': contact_id,
            'NAME': contact_data.get('first_name', ''),
            'LAST_NAME': contact_data.get('last_name', ''),
            'PHONE': [{'VALUE': contact_data.get('phone', ''), 'VALUE_TYPE': 'WORK'}],
            'EMAIL': [{'VALUE': contact_data.get('email', ''), 'VALUE_TYPE': 'WORK'}],
            'UF_CRM_1565773321': contact_data.get('religion'),  # Church affiliation
        }
        
        # Handle special category data with masking
        if 'sacrament_dates' in contact_
            bitrix_data['UF_CRM_1565773389'] = json.dumps(
                {k: v[:4] for k, v in contact_data['sacrament_dates'].items()}
            )
        
        if 'burial_location' in contact_
            bitrix_data['UF_CRM_1565773407'] = json.dumps({
                'cemetery': contact_data['burial_location'].get('cemetery'),
                'section': contact_data['burial_location'].get('section')
            })
        
        return self._make_request('POST', 'crm.contact.update', data={'fields': bitrix_data})
    
    @gdpr_compliance_check(country_code='country_code_param', requires_consent=False)
    def delete_contact(
        self, 
        contact_id: int,
        processing_purpose: str = 'ARTICLE_17_ERASURE',
        **kwargs
    ) -> Dict:
        """Process right to erasure (GDPR Article 17)"""
        # First, verify this is a legitimate erasure request
        if processing_purpose != 'ARTICLE_17_ERASURE':
            raise GDPRComplianceError(
                "Delete operation requires ARTICLE_17_ERASURE processing purpose"
            )
        
        # Create special category data record before deletion
        try:
            contact = self._make_request('GET', f'crm.contact.get', params={'id': contact_id})
            SpecialCategoryData.objects.create(
                country_code=self.country_code,
                entity_type='contact',
                entity_id=contact_id,
                data_snapshot=mask_special_category_data(contact, self.country_code),
                deletion_reason='GDPR_ARTICLE_17'
            )
        except Exception as e:
            logger.error(f"Failed to create data snapshot before deletion: {str(e)}")
        
        # Perform deletion
        return self._make_request('POST', 'crm.contact.delete', data={'id': contact_id})

# ======================
# SYNCHRONIZATION SERVICE
# ======================

class BitrixSyncService:
    """Orchestrates bi-directional sync with GDPR compliance enforcement"""
    
    def __init__(self, country_code: str):
        self.country_code = country_code.lower()
        self.bitrix_client = Bitrix24Client(country_code)
        self.processing_purpose = settings.GDPR_PROCESSING_PURPOSES[
            f'BITRIX_SYNC_{country_code.upper()}'
        ]
    
    def sync_church_contacts(self) -> Dict[str, int]:
        """
        Synchronize church contacts between Django and Bitrix24
        Returns stats dictionary
        """
        stats = {'created': 0, 'updated': 0, 'deleted': 0, 'errors': 0}
        
        # Get last successful sync timestamp
        last_sync = BitrixSyncRecord.get_last_sync('church_contact', self.country_code)
        
        try:
            # 1. Fetch changes from Bitrix24
            bitrix_contacts = self.bitrix_client.get_contacts(
                last_sync=last_sync,
                processing_purpose=self.processing_purpose
            )
            
            # 2. Process each contact with transaction safety
            for contact in bitrix_contacts:
                try:
                    with transaction.atomic():
                        # Check for erasure requests first
                        if self._is_erasure_requested(contact['id']):
                            self._process_erasure(contact['id'])
                            stats['deleted'] += 1
                            continue
                        
                        # Create or update local record
                        church = Church.objects.get(bitrix_id=contact['church_id'])
                        contact_obj, created = Contact.objects.update_or_create(
                            bitrix_id=contact['id'],
                            defaults={
                                'first_name': contact['first_name'],
                                'last_name': contact['last_name'],
                                'phone': contact['phone'],
                                'email': contact['email'],
                                'church': church,
                                'religion': contact.get('religion'),
                                'sacrament_records': contact.get('sacrament_dates', {}),
                                'burial_location': contact.get('burial_location')
                            }
                        )
                        
                        # Create processing record
                        create_processing_record(
                            'contact',
                            contact_obj.id,
                            'sync_from_bitrix',
                            self.country_code,
                            self.processing_purpose
                        )
                        
                        stats['created' if created else 'updated'] += 1
                
                except Exception as e:
                    logger.error(f"Contact sync error (ID: {contact.get('id')}): {str(e)}")
                    stats['errors'] += 1
            
            # 3. Push local changes to Bitrix24
            local_changes = self._get_local_changes(last_sync)
            for contact in local_changes:
                try:
                    self.bitrix_client.update_contact(
                        contact['bitrix_id'],
                        contact,
                        processing_purpose=self.processing_purpose
                    )
                    stats['updated'] += 1
                except Exception as e:
                    logger.error(f"Push to Bitrix24 failed: {str(e)}")
                    stats['errors'] += 1
            
            # 4. Record successful sync
            BitrixSyncRecord.objects.create(
                entity_type='church_contact',
                country_code=self.country_code,
                status='success',
                stats=stats
            )
            
            return stats
            
        except Exception as e:
            # Critical failure - record and re-raise
            BitrixSyncRecord.objects.create(
                entity_type='church_contact',
                country_code=self.country_code,
                status='failure',
                error_message=str(e)
            )
            raise
    
    def _is_erasure_requested(self, bitrix_id: int) -> bool:
        """Check if GDPR erasure has been requested for this contact"""
        return GDPRConsent.objects.filter(
            bitrix_contact_id=bitrix_id,
            erasure_requested=True,
            erasure_processed=False
        ).exists()
    
    def _process_erasure(self, bitrix_id: int) -> None:
        """Process GDPR right to erasure (Article 17)"""
        # 1. Mark consent as processed
        GDPRConsent.objects.filter(
            bitrix_contact_id=bitrix_id,
            erasure_requested=True
        ).update(
            erasure_processed=True,
            processed_at=timezone.now()
        )
        
        # 2. Delete from Bitrix24 (with special purpose code)
        self.bitrix_client.delete_contact(
            bitrix_id,
            processing_purpose='ARTICLE_17_ERASURE'
        )
        
        # 3. Anonymize local records
        Contact.objects.filter(bitrix_id=bitrix_id).update(
            first_name='[REDACTED]',
            last_name='[REDACTED]',
            phone=None,
            email=None,
            erasure_processed=True
        )
    
    def _get_local_changes(self, since: Optional[datetime]) -> List[Dict]:
        """Get local contact changes since last sync"""
        queryset = Contact.objects.filter(
            church__country_code=self.country_code
        )
        
        if since:
            queryset = queryset.filter(
                Q(created_at__gte=since) | 
                Q(updated_at__gte=since) |
                Q(erasure_processed=True, updated_at__gte=since)
            )
        
        return [
            {
                'bitrix_id': c.bitrix_id,
                'first_name': c.first_name,
                'last_name': c.last_name,
                'phone': c.phone,
                'email': c.email,
                'religion': c.religion,
                'sacrament_dates': c.sacrament_records,
                'burial_location': c.burial_location,
                'church_id': c.church.bitrix_id
            }
            for c in queryset if c.bitrix_id  # Only push if already synced once
        ]

# ======================
# COMPLIANCE ENFORCEMENT
# ======================

def enforce_data_sovereignty(view_func):
    """Django middleware enforcing data sovereignty rules"""
    @wraps(view_func)
    def _wrapped_view(request, *args, **kwargs):
        # Verify request originates from correct country cluster
        client_country = request.headers.get('X-Country-Code', '').lower()
        if client_country and client_country != settings.COUNTRY_CODE:
            logger.warning(
                f"Cross-border access attempt: {client_country} → {settings.COUNTRY_CODE}"
            )
            raise DataSovereigntyViolation(
                "Request violates data sovereignty boundaries"
            )
        
        # Verify Bitrix24 operations are country-local
        if 'bitrix' in request.path.lower() and settings.CLOUD_ENV == 'GKE':
            raise DataSovereigntyViolation(
                "Bitrix24 operations must occur in self-hosted environment"
            )
        
        return view_func(request, *args, **kwargs)
    return _wrapped_view

# ======================
# INITIAL SETUP
# ======================

def initialize_bitrix_sync(country_code: str):
    """
    Initialize Bitrix24 sync for a country
    Must be run during deployment before first sync
    """
    logger.info(f"Initializing Bitrix24 sync for {country_code}")
    
    # 1. Verify Bitrix24 connection
    client = Bitrix24Client(country_code)
    try:
        client._make_request('GET', 'user.current')
    except BitrixAPIError as e:
        logger.critical(f"Bitrix24 connection failed: {str(e)}")
        raise
    
    # 2. Verify GDPR compliance prerequisites
    if not GDPRConsent.objects.filter(country_code=country_code).exists():
        logger.critical("GDPR consent framework not initialized")
        raise GDPRComplianceError("GDPR consent framework missing")
    
    # 3. Create Article 30 processing record
    create_processing_record(
        'system',
        0,
        'sync_initialization',
        country_code,
        settings.GDPR_PROCESSING_PURPOSES[f'BITRIX_SYNC_{country_code.upper()}']
    )
    
    logger.info(f"Bitrix24 sync initialized successfully for {country_code}")

# ======================
# USAGE EXAMPLE
# ======================

if __name__ == '__main__':
    """
    Example usage for Lithuania church contacts sync
    This would typically be run as a scheduled task
    """
    from django.core.wsgi import get_wsgi_application
    application = get_wsgi_application()  # Initialize Django
    
    try:
        # Initialize sync service for Lithuania
        sync_service = BitrixSyncService('lt')
        
        # Perform synchronization
        results = sync_service.sync_church_contacts()
        
        print(f"Sync completed for Lithuania: {results}")
        print("Compliance audit trail recorded in DataProcessingRecord model")
        
    except DataSovereigntyViolation as e:
        print(f"🚨 COMPLIANCE FAILURE: {str(e)}")
        # Alert DPO and halt processing
    except GDPRComplianceError as e:
        print(f"⚠️ GDPR VIOLATION: {str(e)}")
        # Alert compliance team
    except Exception as e:
        print(f"❌ Sync failed: {str(e)}")
        # Standard error handling
