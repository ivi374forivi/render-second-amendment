# RenderOSArms

> Interactive 3D Model Repository for Open-Source Firearm Designs

[![License](https://img.shields.io/badge/license-ISC-blue.svg)](LICENSE)
[![Version](https://img.shields.io/badge/version-2.1.0-green.svg)](package.json)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](CONTRIBUTING.md)

## 🎯 Overview

RenderOSArms is a comprehensive platform for viewing, analyzing, and interacting with 3D-printable firearm models. The repository combines an extensive model library with cutting-edge visualization technology and AI-powered assistance to provide an unparalleled user experience.

### Key Features

- 📚 **Extensive Model Library** - Hundreds of organized, documented models
- 🎨 **3D Interactive Viewer** - Real-time visualization with assembly/disassembly
- 🤖 **AI-Powered Assistance** - Multiple specialized agent personas
- 👥 **Community Driven** - Open collaboration and contributions
- 🔒 **Safety First** - Comprehensive safety and legal guidance
- ✅ **Quality Assurance** - Automated validation and scoring

## 🚀 Quick Start

**New to RenderOSArms?** Check out our **[Quick Start Guide](QUICK_START_GUIDE.md)** for a beginner-friendly walkthrough!

### Prerequisites

- Node.js (v14 or higher)
- npm (v6 or higher)
- Modern web browser with WebGL support

### Installation

```bash
# Clone the repository
git clone https://github.com/4-b100m/renderOSArms.git
cd renderOSArms

# Install dependencies
npm install

# Generate model index
npm run list

# Validate models (optional)
npm run validate
```

### Usage

#### Browse Models

Open `docs/index.html` in your web browser or:

```bash
npm start  # Starts local server (when implemented)
```

#### 3D Viewer

Open `docs/viewer.html` to access the interactive 3D model viewer with:
- Assembly/disassembly animations
- Customizable materials and lighting
- Multiple viewing angles
- Part selection and inspection

### Deployment

Want to deploy your own instance? See **[Free Hosting Options](FREE_HOSTING_OPTIONS.md)** for complete guides to 7 free hosting platforms.

## 📖 Documentation

**📚 Complete Documentation Hub:** See **[DOCUMENTATION_INDEX.md](DOCUMENTATION_INDEX.md)** for navigation across all 18 documents.

### 🎯 Essential Docs

- **[Quick Start Guide](QUICK_START_GUIDE.md)** - Beginner-friendly launch guide
- **[Documentation Index](DOCUMENTATION_INDEX.md)** - Master navigation hub
- **[Roadmap](ROADMAP.md)** - Strategic vision through 2027+
- **[Free Hosting Options](FREE_HOSTING_OPTIONS.md)** - Deployment guides

### User Documentation

- **[Quick Start Guide](QUICK_START_GUIDE.md)** - Step-by-step for beginners
- **[3D Viewer Guide](docs/viewer.html)** - Using the interactive viewer
- **[Search Guide](docs/index.html)** - Finding models effectively
- **[Community Guide](COMMUNITY.md)** - Engagement and participation

### Developer Documentation

- **[Architecture](ARCHITECTURE.md)** - System design and components
- **[API Documentation](API.md)** - RESTful API reference
- **[Contributing](CONTRIBUTING.md)** - Contribution guidelines
- **[Model Standards](MODEL_STANDARDS.md)** - Quality standards
- **[Ecosystem](ECOSYSTEM.md)** - 30+ integration specifications

### AI & Orchestration

- **[AI Agents](AI_AGENTS.md)** - Agent personas and capabilities
- **[Agentic Orchestration](AGENTIC_ORCHESTRATION.md)** - Multi-agent coordination framework

### Governance & Planning

- **[Roadmap](ROADMAP.md)** - Multi-year strategic plan (v2.2 → v5.0)
- **[Governance](GOVERNANCE.md)** - Project governance and decision-making
- **[Branch Merge Strategy](BRANCH_MERGE_STRATEGY.md)** - Development workflow

### Safety & Legal

- **[Security Policy](SECURITY.md)** - Security practices and reporting
- **[Legal Compliance](MODEL_STANDARDS.md#legal-compliance)** - Regulatory information

## 🛠️ Features

### 3D Interactive Viewer

- **Assembly States** - Smoothly transition between assembled and exploded views
- **Material Customization** - Adjust colors, shininess, and surface properties
- **Lighting Control** - Fine-tune ambient, directional, and rim lighting
- **Background Options** - Choose from multiple environments
- **Camera Controls** - Orbit, pan, zoom, and preset views
- **Part Selection** - Click parts for detailed information

### AI Agent System

Five specialized agents to assist you:

1. **Model Guide** - Find and compare models
2. **Technical Advisor** - Print settings and specifications
3. **Safety Compliance** - Legal and safety information
4. **Community Liaison** - Connect with other users
5. **Educational Agent** - Learn about designs and mechanics

### Model Validation

Automated quality checks for:
- Directory structure
- Required documentation
- File formats and quality
- Safety warnings
- Legal compliance

Run validation: `npm run validate [model-path]`

## 📦 Repository Structure

```
renderOSArms/
├── docs/                    # Web application
│   ├── index.html          # Model browser
│   ├── viewer.html         # 3D viewer
│   ├── viewer3d.js         # 3D engine
│   └── ...
├── scripts/                # Automation scripts
│   ├── ModelValidator.js   # Validation logic
│   └── validate-models.js  # CLI validator
├── Accessories/            # Accessory models
├── Pistols_and_Subs/      # Handgun models
├── Rifles/                 # Rifle models
├── Tools/                  # Tool models
├── *.md                    # Documentation
└── package.json           # Project configuration
```

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

### Ways to Contribute

- 📝 **Add Models** - Submit new designs
- 🐛 **Report Issues** - Help identify problems
- 💡 **Suggest Features** - Share your ideas
- 📖 **Improve Docs** - Enhance documentation
- 🧪 **Test** - Validate models and features
- 🎨 **Design** - Improve UI/UX

### Submission Process

1. Fork the repository
2. Create a feature branch
3. Follow [Model Standards](MODEL_STANDARDS.md)
4. Run validation: `npm run validate`
5. Submit a pull request

## 🎯 Model Quality

All models are scored on:

- **Documentation** (30%)
- **File Completeness** (25%)
- **Visual Quality** (20%)
- **Technical Accuracy** (15%)
- **Safety & Legal** (10%)

**Target Score:** 70+ (Grade C or better)

## ⚠️ Safety & Legal

### Safety First

- Always follow firearms safety rules
- Inspect all parts before assembly
- Test fire in controlled environments
- Use appropriate materials
- Regular safety inspections

### Legal Compliance

- **Know Your Laws** - Research local regulations
- **Licensing** - Obtain required permits
- **Age Restrictions** - Must be of legal age
- **Prohibited Persons** - Comply with restrictions
- **Export Control** - No international distribution

**YOU are responsible for legal compliance.**

## 🌟 Community

### Get Involved

- **GitHub Discussions** - Ask questions, share builds
- **Discord** - Real-time community chat (coming soon)
- **Newsletter** - Monthly updates (coming soon)

### Recognition

Contributors earn badges for:
- Quality submissions
- Helpful answers
- Documentation improvements
- Bug reports
- Community leadership

## 📊 Statistics

- **Total Models:** 250+
- **Categories:** 7 major categories
- **Contributors:** Various artists and designers
- **License:** Open Source (ISC)

## 🗺️ Roadmap

**📋 Full Roadmap:** See **[ROADMAP.md](ROADMAP.md)** for comprehensive multi-year strategic plan through 2027+

### Version 2.1 (Current - Q4 2025)
- ✅ 3D interactive viewer
- ✅ AI agent system (pattern-matching)
- ✅ Model validation
- ✅ Comprehensive documentation (185 pages)
- ✅ Server-side API foundation
- ✅ GitHub Actions CI/CD

### Version 2.2 (Q4 2025 - Testing Phase)
- [ ] Jest/Mocha testing infrastructure
- [ ] User authentication (OAuth)
- [ ] PostgreSQL database integration
- [ ] Enhanced API with rate limiting
- [ ] Automated testing in CI/CD

### Version 2.5 (Q1 2026 - Community Phase)
- [ ] User profiles and favorites
- [ ] Model ratings and reviews
- [ ] Social features and sharing
- [ ] Discussion forums

### Version 3.0 (Q2 2026 - Expansion Phase)
- [ ] Mobile applications (iOS/Android)
- [ ] Desktop applications (Electron)
- [ ] Plugin system and marketplace
- [ ] Model remixing tools

### Version 3.5 (Q3 2026 - Intelligence Phase)
- [ ] Advanced AI (GPT-4/Claude integration)
- [ ] Multi-agent orchestration
- [ ] Intelligent recommendations
- [ ] Automated model analysis

### Version 4.0+ (2026-2027 - Ecosystem Phase)
- [ ] 50+ partnerships and integrations
- [ ] AR/VR viewer integration
- [ ] Blockchain verification (optional)
- [ ] Global community expansion

## 📝 License

This project is licensed under the ISC License - see the [LICENSE](LICENSE) file for details.

Individual models may have their own licenses - check model READMEs.

## 🙏 Acknowledgments

This repository brings together designs from across the open-source community:

- **FOSSCAD** - Pioneering open-source firearms
- **IvanTheTroll** - Innovative designs
- **Det_Disp** - Various contributions
- **Community Contributors** - Countless designers and testers

## 📞 Contact & Support

- **Issues:** [GitHub Issues](https://github.com/4-b100m/renderOSArms/issues)
- **Security:** See [SECURITY.md](SECURITY.md)
- **General:** See [COMMUNITY.md](COMMUNITY.md)

## ⚡ Quick Links

- [Browse Models](docs/index.html)
- [3D Viewer](docs/viewer.html)
- [Contribute](CONTRIBUTING.md)
- [Documentation](ARCHITECTURE.md)
- [Standards](MODEL_STANDARDS.md)

---

**Made with 🔧 by the Open Source Community**

*For educational and lawful purposes only. Users are responsible for compliance with all applicable laws.*