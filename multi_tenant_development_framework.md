# JOURNEY OF LIFE (JOL) MULTI-TENANT DEVELOPMENT FRAMEWORK
# Optimized Prompt for AI Assistants (Ready to Paste into Copilot/Spark)

```
## CORE REQUIREMENTS

### 1. Repository Template Structure
Create a standardized filesystem layout for both core and template repositories that enforces consistency while allowing country-specific customization. Provide concrete examples for:
- journey-of-life-core (global foundation)
- template-parish (church subdomain template)
- template-funeral-service (service template)
- country-specific repositories (e.g., lt-jol)

### 2. Developer Experience
Provide a complete VS Code workspace configuration including:
- settings.json with formatting/linting rules
- extensions.json with required extensions
- devcontainer.json for isolated development
- .gitignore optimized for multi-tenant projects
- pre-commit hooks for quality enforcement

### 3. CI/CD Automation
Provide annotated GitHub Actions workflows for:
- Linting, testing, building (with Node.js matrix)
- Preview deployments per PR with auto-comment
- Production deployment with promotion strategy
- Semantic versioning and changelog generation
- Automated dependency updates with security policies

### 4. Template Management System
Provide scripts for:
- Scaffolding new template instances from core
- Synchronizing shared components across repositories
- Batch repository maintenance operations
- Country-specific configuration management

### 5. Quality Assurance
Include:
- SEO checklist with automated Lighthouse scores
- Accessibility audit requirements (WCAG 2.1)
- UI/UX design system enforcement
- GDPR compliance checks per country

### 6. Documentation Standards
Provide template README.md and CONTRIBUTING.md files that:
- Explain multi-tenant architecture clearly
- Include step-by-step onboarding for students
- Document country-specific requirements
- Specify permissions model for GitHub teams

## IMPLEMENTATION CONSTRAINTS

1. Use Node.js + Astro framework for concrete examples (language-agnostic where possible)
2. Prioritize security with least-privilege secrets management
3. Ensure all solutions work with Visual Studio Code as primary IDE
4. Include country-specific compliance requirements (GDPR variations)
5. Provide minimal but fully functional configuration examples
6. Focus on reproducibility for student developers

## OUTPUT FORMAT REQUIREMENTS

For each component requested, provide:
1. Concrete file examples with complete syntax
2. Minimal code snippets with clear annotations
3. Required secrets and permissions documentation
4. Step-by-step execution instructions
5. Country-specific implementation notes where applicable

## DELIVERABLES CHECKLIST

[ ] Repository template structure with file examples
[ ] VS Code workspace configuration files
[ ] Devcontainer setup with startup commands
[ ] GitHub Actions workflows (5+ types)
[ ] Template synchronization scripts
[ ] Quality assurance checklists
[ ] Documentation templates
[ ] One-page student quickstart guide
```

## Step-by-Step Implementation Guide for VS Code

### 1. Setting Up Your Workspace

**Step 1: Create a new workspace**
```bash
mkdir jol-multi-tenant-workspace
cd jol-multi-tenant-workspace
code .
```

**Step 2: Initialize workspace structure**
```bash
# Create core repository structure
mkdir -p journey-of-life-core/{.devcontainer,.github/workflows,src/{components,templates,countries},config,scripts}

# Create template repository examples
mkdir -p template-parish/{src,pages,styles}
mkdir -p template-funeral-service/{src,pages,styles}
mkdir -p lt-jol/{src,countries/lt}
```

**Step 3: Save this workspace configuration**
1. In VS Code: File > Save Workspace As...
2. Name: `jol-multi-tenant.code-workspace`
3. Add these folders to your workspace:
```json
{
  "folders": [
    { "path": "journey-of-life-core" },
    { "path": "template-parish" },
    { "path": "template-funeral-service" },
    { "path": "lt-jol" }
  ]
}
```

### 2. Using the Optimized Prompt

**Method A: Direct Paste into Copilot Chat**
1. Open your `journey-of-life-core` repository in VS Code
2. Highlight the root directory files to provide context
3. Open Copilot Chat (View > Chat)
4. Paste the entire optimized prompt above
5. Add this specific request: "Focus on Lithuania implementation first with GDPR LT requirements"

**Method B: Targeted Queries**
For specific components, use these precise queries:

```markdown
# For repository structure:
"Show complete filesystem layout for journey-of-life-core with concrete examples of country-specific configuration files for Lithuania (GDPR LT compliant)"

# For GitHub Actions:
"Provide annotated GitHub Actions workflow for PR preview deployments that includes Lithuanian language checks and GDPR compliance verification"

# For devcontainer:
"Create devcontainer.json for journey-of-life-core that includes Node.js 18, Astro, and Lithuanian language tools with proper security context"
```

### 3. Implementing Generated Solutions

**When you receive AI-generated code:**
1. **Validate security**: Check for hardcoded secrets or excessive permissions
2. **Verify country requirements**: Ensure GDPR LT compliance is addressed
3. **Test in container**: Always test devcontainer configurations before committing
4. **Document variations**: Note country-specific differences in comments

**Example workflow for implementing a GitHub Action:**
```bash
# 1. Create the workflow file
mkdir -p .github/workflows
touch .github/workflows/pr-preview.yml

# 2. Paste the generated workflow (example)
name: PR Preview Deployment

on:
  pull_request:
    types: [opened, synchronize, reopened]
    branches: [main]

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    environment: preview
    permissions:
      contents: read
      id-token: write  # For Google Cloud deployment
    
    steps:
    - name: Checkout code
      uses: actions/checkout@v4
      
    - name: Setup Node.js
      uses: actions/setup-node@v4
      with:
        node-version: 18.x
        
    - name: Install dependencies
      run: npm ci
      
    - name: Build site
      run: npm run build
      
    - name: Deploy to preview
      uses: GoogleCloudPlatform/github-actions/setup-gcloud@master
      with:
        version: 'latest'
        service_account_key: ${{ secrets.GCP_SA_KEY }}
        project_id: ${{ secrets.GCP_PROJECT_ID }}
      
    - name: Post preview URL
      run: |
        echo "🌍 Preview URL: https://pr-${{ github.event.number }}.jol.lt"
        gh pr comment ${{ github.event.pull_request.html_url }} --body "✅ Preview deployed: https://pr-${{ github.event.number }}.jol.lt"
      env:
        GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

### 4. Student Onboarding Quickstart (One-Page Guide)

**JOL Multi-Tenant Developer Quickstart**  
*For Lithuania Implementation (gyvenimo-kelias.lt)*

1. **Setup Environment**
```bash
git clone https://github.com/JourneyOfLife-EU/journey-of-life-core.git
cd journey-of-life-core
code . --reuse-window
```

2. **Open in Dev Container**
- Click "Reopen in Container" when VS Code prompts you
- Wait for container initialization (5-10 minutes first time)

3. **Create New Church Subdomain**
```bash
npm run scaffold:parish -- --name="Vilnius Cathedral" --country=lt
```

4. **Run Local Development**
```bash
npm run dev
# Visit http://localhost:3000 (Lithuanian language auto-detected)
```

5. **Submit Changes**
```bash
git checkout -b lt/cathedral-update
git add .
git commit -m "feat(lt): add Vilnius Cathedral subdomain"
git push origin lt/cathedral-update
```

6. **Verify Compliance**
- Automatic checks will run for:
  ✓ GDPR Article 17 compliance (LT law)
  ✓ WCAG 2.1 AA accessibility
  ✓ Lithuanian language validation
  ✓ SEO metadata requirements

**Critical Secrets Needed** (Ask team lead):
- `BITRIX24_LT_API_KEY`
- `GDPR_COMPLIANCE_CERT`
- `GCP_SA_KEY` (for preview deployments)

**Country-Specific Notes for Lithuania:**
- All personal data must be stored in Vilnius data center
- Cookie consent banner must use Lithuanian language first
- Church service times must follow LT time formats (HH:mm)
- Payment processing must support Banklink integration

---

This prompt and guide gives you everything needed to implement a professional multi-tenant architecture for the Journey of Life project while ensuring:
- GDPR compliance across all 27 EU countries
- Reproducible developer environments
- Automated quality checks
- Clear student onboarding
- Proper secrets management

The structure follows enterprise-grade practices while remaining accessible for developers, with special attention to Lithuanian legal requirements as your initial deployment target.
