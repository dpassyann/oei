#!/usr/bin/env python3
import re
from pathlib import Path

files_to_fix = [
    "backend/infrastructure/persistence/src/main/java/global/oei/infrastructure/persistence/home/HomeDomainAreaDetailPersistenceAdapter.java",
    "backend/infrastructure/persistence/src/main/java/global/oei/infrastructure/persistence/network/NetworkGraphPersistenceAdapter.java",
    "backend/infrastructure/persistence/src/main/java/global/oei/infrastructure/persistence/content/ContentPersistenceAdapter.java",
    "backend/infrastructure/persistence/src/main/java/global/oei/infrastructure/persistence/institution/EmploymentAffiliationPersistenceAdapter.java",
    "backend/infrastructure/persistence/src/main/java/global/oei/infrastructure/persistence/institution/InstitutionInvitationPersistenceAdapter.java",
    "backend/infrastructure/persistence/src/main/java/global/oei/infrastructure/persistence/institution/InstitutionPublicationPersistenceAdapter.java",
    "backend/infrastructure/persistence/src/main/java/global/oei/infrastructure/persistence/institution/InstitutionPersistenceAdapter.java",
    "backend/infrastructure/persistence/src/main/java/global/oei/infrastructure/persistence/institution/InstitutionOpportunityPersistenceAdapter.java",
    "backend/infrastructure/persistence/src/main/java/global/oei/infrastructure/persistence/wallet/WalletPassPersistenceAdapter.java",
    "backend/infrastructure/persistence/src/main/java/global/oei/infrastructure/persistence/event/EventPersistenceAdapter.java",
    "backend/infrastructure/persistence/src/main/java/global/oei/infrastructure/persistence/event/EventProposalPersistenceAdapter.java",
    "backend/infrastructure/persistence/src/main/java/global/oei/infrastructure/persistence/certification/RecognizedCertificationPersistenceAdapter.java",
    "backend/infrastructure/persistence/src/main/java/global/oei/infrastructure/persistence/store/OrderPersistenceAdapter.java",
    "backend/infrastructure/persistence/src/main/java/global/oei/infrastructure/persistence/store/ProductPersistenceAdapter.java",
    "backend/infrastructure/persistence/src/main/java/global/oei/infrastructure/persistence/badge/BadgePersistenceAdapter.java",
]

for file_path in files_to_fix:
    if not Path(file_path).exists():
        print(f"✗ Not found: {file_path}")
        continue

    with open(file_path, 'r') as f:
        content = f.read()

    # Find star imports
    star_imports = re.findall(r'import ([\w.]+)\.\*;', content)

    if star_imports:
        # Remove star imports
        content = re.sub(r'import [\w.]+\.\*;\n', '', content)

        with open(file_path, 'w') as f:
            f.write(content)

        print(f"✓ Removed star imports from {Path(file_path).name}: {star_imports}")
    else:
        print(f"~ No star imports in {Path(file_path).name}")

print("\nDone!")

