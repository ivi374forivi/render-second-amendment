/**
 * Model Validation System
 * 
 * Comprehensive validation for 3D models including:
 * - Structural integrity checks
 * - Safety analysis
 * - Quality scoring
 * - Completeness verification
 */

const fs = require('fs');
const path = require('path');

class ModelValidator {
  constructor() {
    this.validationRules = {
      fileFormats: ['.stl', '.step', '.stp', '.igs', '.iges'],
      requiredFiles: ['README.md'],
      imageFormats: ['.jpg', '.jpeg', '.png', '.gif'],
      maxFileSize: 100 * 1024 * 1024, // 100MB
      minReadmeLength: 100 // characters
    };

    this.results = {
      passed: [],
      warnings: [],
      errors: [],
      score: 0
    };
  }

  /**
   * Validate a model directory
   */
  async validateModel(modelPath) {
    console.log(`\nValidating model: ${modelPath}`);
    this.results = {
      passed: [],
      warnings: [],
      errors: [],
      score: 0
    };

    try {
      // Check if directory exists
      if (!fs.existsSync(modelPath)) {
        this.addError('Model directory does not exist');
        return this.getResults();
      }

      // Run validation checks
      await this.checkDirectoryStructure(modelPath);
      await this.checkRequiredFiles(modelPath);
      await this.checkReadmeQuality(modelPath);
      await this.check3DFiles(modelPath);
      await this.checkRenderImages(modelPath);
      await this.checkDocumentation(modelPath);
      
      // Enhanced validation checks
      await this.checkSecurityIssues(modelPath);
      await this.checkAccessibility(modelPath);
      await this.checkPerformance(modelPath);

      // Calculate overall score
      this.calculateScore();

      return this.getResults();
    } catch (error) {
      this.addError(`Validation error: ${error.message}`);
      return this.getResults();
    }
  }

  /**
   * Check directory structure
   */
  async checkDirectoryStructure(modelPath) {
    const requiredDirs = ['STL', 'Renders'];
    const optionalDirs = ['STEP', 'IGS', 'SLDPRT', 'IPT', 'Spec_Sheets'];

    requiredDirs.forEach(dir => {
      const dirPath = path.join(modelPath, dir);
      if (fs.existsSync(dirPath) && fs.statSync(dirPath).isDirectory()) {
        this.addPass(`Required directory found: ${dir}`);
      } else {
        this.addWarning(`Missing recommended directory: ${dir}`);
      }
    });

    optionalDirs.forEach(dir => {
      const dirPath = path.join(modelPath, dir);
      if (fs.existsSync(dirPath) && fs.statSync(dirPath).isDirectory()) {
        this.addPass(`Optional directory found: ${dir}`);
      }
    });
  }

  /**
   * Check required files
   */
  async checkRequiredFiles(modelPath) {
    this.validationRules.requiredFiles.forEach(file => {
      const filePath = path.join(modelPath, file);
      if (fs.existsSync(filePath)) {
        this.addPass(`Required file found: ${file}`);
      } else {
        this.addError(`Missing required file: ${file}`);
      }
    });
  }

  /**
   * Check README quality
   */
  async checkReadmeQuality(modelPath) {
    const readmePath = path.join(modelPath, 'README.md');
    
    if (!fs.existsSync(readmePath)) {
      return;
    }

    const content = fs.readFileSync(readmePath, 'utf-8');

    // Check length
    if (content.length < this.validationRules.minReadmeLength) {
      this.addWarning('README is too short, consider adding more details');
    } else {
      this.addPass('README has adequate content');
    }

    // Check for important sections
    const sections = [
      'Description',
      'Specifications',
      'Parts List',
      'Assembly',
      'Print Settings',
      'Hardware',
      'Safety',
      'Legal'
    ];

    sections.forEach(section => {
      const regex = new RegExp(`#{1,3}\\s*${section}`, 'i');
      if (regex.test(content)) {
        this.addPass(`README includes ${section} section`);
      } else {
        this.addWarning(`README missing ${section} section`);
      }
    });

    // Check for safety warnings
    if (/safety|warning|caution/i.test(content)) {
      this.addPass('README includes safety information');
    } else {
      this.addWarning('README should include safety warnings');
    }

    // Check for legal notices
    if (/legal|regulation|law|compliance/i.test(content)) {
      this.addPass('README includes legal notices');
    } else {
      this.addWarning('README should include legal compliance information');
    }
  }

  /**
   * Check 3D model files
   */
  async check3DFiles(modelPath) {
    const files = this.getAllFiles(modelPath);
    const modelFiles = files.filter(file => {
      const ext = path.extname(file).toLowerCase();
      return this.validationRules.fileFormats.includes(ext);
    });

    if (modelFiles.length === 0) {
      this.addError('No 3D model files found');
      return;
    }

    this.addPass(`Found ${modelFiles.length} 3D model file(s)`);

    // Check file sizes
    modelFiles.forEach(file => {
      const stats = fs.statSync(file);
      if (stats.size > this.validationRules.maxFileSize) {
        this.addWarning(`Large file: ${path.basename(file)} (${this.formatBytes(stats.size)})`);
      }
    });

    // Check for multiple formats
    const formats = new Set(modelFiles.map(f => path.extname(f).toLowerCase()));
    if (formats.size > 1) {
      this.addPass(`Multiple formats available: ${Array.from(formats).join(', ')}`);
    }
  }

  /**
   * Check render images
   */
  async checkRenderImages(modelPath) {
    const rendersDir = path.join(modelPath, 'Renders');
    
    if (!fs.existsSync(rendersDir)) {
      this.addWarning('No Renders directory found');
      return;
    }

    const files = fs.readdirSync(rendersDir);
    const images = files.filter(file => {
      const ext = path.extname(file).toLowerCase();
      return this.validationRules.imageFormats.includes(ext);
    });

    if (images.length === 0) {
      this.addWarning('No render images found');
    } else if (images.length < 3) {
      this.addWarning('Consider adding more render images (minimum 3 recommended)');
    } else {
      this.addPass(`Found ${images.length} render images`);
    }

    // Check image quality (basic)
    images.forEach(image => {
      const stats = fs.statSync(path.join(rendersDir, image));
      if (stats.size < 50 * 1024) { // Less than 50KB
        this.addWarning(`Low quality image: ${image}`);
      }
    });
  }

  /**
   * Check documentation completeness
   */
  async checkDocumentation(modelPath) {
    const readmePath = path.join(modelPath, 'README.md');
    
    if (!fs.existsSync(readmePath)) {
      return;
    }

    const content = fs.readFileSync(readmePath, 'utf-8');

    // Check for specifications
    const specs = [
      'caliber',
      'version',
      'author',
      'material',
      'infill',
      'layer height'
    ];

    specs.forEach(spec => {
      const regex = new RegExp(spec, 'i');
      if (regex.test(content)) {
        this.addPass(`Includes ${spec} specification`);
      }
    });

    // Check for links
    if (/\[.*\]\(.*\)/.test(content)) {
      this.addPass('Includes reference links');
    }

    // Check for images
    if (/!\[.*\]\(.*\)/.test(content)) {
      this.addPass('Includes embedded images in README');
    }
    
    // Check for tables (structured data)
    if (/\|.*\|/.test(content)) {
      this.addPass('Includes tables for structured information');
    }
    
    // Check for code blocks (print settings, etc.)
    if (/```/.test(content)) {
      this.addPass('Includes code blocks for technical details');
    }
  }

  /**
   * Check for security issues in documentation
   */
  async checkSecurityIssues(modelPath) {
    const readmePath = path.join(modelPath, 'README.md');
    
    if (!fs.existsSync(readmePath)) {
      return;
    }

    const content = fs.readFileSync(readmePath, 'utf-8');
    
    // Check for potentially dangerous content
    const dangerousPatterns = [
      { pattern: /<script/i, message: 'Contains potential XSS script tags' },
      { pattern: /javascript:/i, message: 'Contains javascript: protocol' },
      { pattern: /on\w+\s*=/i, message: 'Contains inline event handlers' }
    ];
    
    dangerousPatterns.forEach(({ pattern, message }) => {
      if (pattern.test(content)) {
        this.addWarning(`Security: ${message}`);
      }
    });
    
    // Check for absolute file paths that might expose system info
    if (/[A-Z]:\\|\/home\/|\/Users\//i.test(content)) {
      this.addWarning('Contains absolute file paths - consider using relative paths');
    }
  }

  /**
   * Check for accessibility issues
   */
  async checkAccessibility(modelPath) {
    const readmePath = path.join(modelPath, 'README.md');
    
    if (!fs.existsSync(readmePath)) {
      return;
    }

    const content = fs.readFileSync(readmePath, 'utf-8');
    
    // Check for alt text on images - use matchAll for better performance
    const imageRegex = /!\[([^\]]*)\]\([^)]+\)/g;
    const matches = [...content.matchAll(imageRegex)];
    let hasEmptyAlt = false;
    
    for (const match of matches) {
      if (!match[1] || match[1].trim() === '') {
        hasEmptyAlt = true;
        break;
      }
    }
    
    if (hasEmptyAlt) {
      this.addWarning('Accessibility: Some images missing alt text');
    } else if (matches.length > 0) {
      this.addPass('All images have alt text');
    }
    
    // Check for proper heading hierarchy
    const headings = content.match(/^#{1,6}\s+.+$/gm);
    if (headings && headings.length > 0) {
      this.addPass('Document uses heading structure');
    } else {
      this.addWarning('Accessibility: No clear heading structure');
    }
  }

  /**
   * Check performance considerations
   */
  async checkPerformance(modelPath) {
    const files = this.getAllFiles(modelPath);
    
    // Check for very large files
    const largeFiles = files.filter(file => {
      const stats = fs.statSync(file);
      return stats.size > 50 * 1024 * 1024; // 50MB
    });
    
    if (largeFiles.length > 0) {
      largeFiles.forEach(file => {
        this.addWarning(`Performance: Very large file ${path.basename(file)} may cause loading issues`);
      });
    }
    
    // Check total model size
    const totalSize = files.reduce((acc, file) => {
      return acc + fs.statSync(file).size;
    }, 0);
    
    if (totalSize > 500 * 1024 * 1024) { // 500MB
      this.addWarning(`Performance: Total model size ${this.formatBytes(totalSize)} is very large`);
    } else {
      this.addPass(`Model size ${this.formatBytes(totalSize)} is reasonable`);
    }
  }

  /**
   * Suggest automated fixes
   */
  suggestFixes() {
    const suggestions = [];
    
    this.results.errors.forEach(error => {
      if (error.includes('Missing required file: README.md')) {
        suggestions.push({
          issue: error,
          fix: 'Create a README.md file with model description, specifications, and assembly instructions',
          automated: false
        });
      }
    });
    
    this.results.warnings.forEach(warning => {
      if (warning.includes('README is too short')) {
        suggestions.push({
          issue: warning,
          fix: 'Expand README with detailed sections: Description, Parts List, Assembly, Print Settings, Safety',
          automated: false
        });
      } else if (warning.includes('missing alt text')) {
        suggestions.push({
          issue: warning,
          fix: 'Add descriptive alt text to all images for accessibility',
          automated: false
        });
      } else if (warning.includes('absolute file paths')) {
        suggestions.push({
          issue: warning,
          fix: 'Replace absolute paths with relative paths',
          automated: true,
          script: 'Replace system-specific paths with repository-relative paths'
        });
      }
    });
    
    return suggestions;
  }

  /**
   * Get all files recursively
   */
  getAllFiles(dirPath, arrayOfFiles = []) {
    const files = fs.readdirSync(dirPath);

    files.forEach(file => {
      const filePath = path.join(dirPath, file);
      if (fs.statSync(filePath).isDirectory()) {
        arrayOfFiles = this.getAllFiles(filePath, arrayOfFiles);
      } else {
        arrayOfFiles.push(filePath);
      }
    });

    return arrayOfFiles;
  }

  /**
   * Calculate overall score
   * Fixed: Use percentage-based scoring for consistency across different models
   */
  calculateScore() {
    const totalChecks = this.results.passed.length +
                        this.results.warnings.length +
                        this.results.errors.length;

    if (totalChecks === 0) {
      this.results.score = 0;
      return;
    }

    // Scoring weights
    const PASS_WEIGHT = 1.0;        // Full credit
    const WARNING_WEIGHT = 0.5;     // Half credit
    const ERROR_WEIGHT = 0.0;       // No credit

    const weightedScore = (
      this.results.passed.length * PASS_WEIGHT +
      this.results.warnings.length * WARNING_WEIGHT +
      this.results.errors.length * ERROR_WEIGHT
    );

    // Calculate percentage
    const percentage = (weightedScore / totalChecks) * 100;

    // Apply penalty for errors (beyond just not getting points)
    const errorPenalty = this.results.errors.length * 5; // 5 points per error

    let finalScore = percentage - errorPenalty;

    // Normalize to 0-100
    finalScore = Math.max(0, Math.min(100, finalScore));

    this.results.score = Math.round(finalScore);
  }

  /**
   * Add validation results
   */
  addPass(message) {
    this.results.passed.push(message);
  }

  addWarning(message) {
    this.results.warnings.push(message);
  }

  addError(message) {
    this.results.errors.push(message);
  }

  /**
   * Get validation results
   */
  getResults() {
    return {
      status: this.results.errors.length === 0 ? 'passed' : 'failed',
      score: this.results.score,
      grade: this.getGrade(),
      passed: this.results.passed,
      warnings: this.results.warnings,
      errors: this.results.errors,
      summary: {
        total: this.results.passed.length + this.results.warnings.length + this.results.errors.length,
        passed: this.results.passed.length,
        warnings: this.results.warnings.length,
        errors: this.results.errors.length
      },
      suggestions: this.suggestFixes()
    };
  }

  /**
   * Get letter grade
   */
  getGrade() {
    const score = this.results.score;
    if (score >= 90) return 'A';
    if (score >= 80) return 'B';
    if (score >= 70) return 'C';
    if (score >= 60) return 'D';
    return 'F';
  }

  /**
   * Format bytes to human readable
   */
  formatBytes(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  }

  /**
   * Print results
   */
  printResults() {
    const results = this.getResults();

    console.log('\n' + '='.repeat(60));
    console.log('VALIDATION RESULTS');
    console.log('='.repeat(60));
    console.log(`Status: ${results.status.toUpperCase()}`);
    console.log(`Score: ${results.score}/100 (Grade: ${results.grade})`);
    console.log(`Passed: ${results.summary.passed}`);
    console.log(`Warnings: ${results.summary.warnings}`);
    console.log(`Errors: ${results.summary.errors}`);

    if (results.errors.length > 0) {
      console.log('\n❌ ERRORS:');
      results.errors.forEach(err => console.log(`  - ${err}`));
    }

    if (results.warnings.length > 0) {
      console.log('\n⚠️  WARNINGS:');
      results.warnings.forEach(warn => console.log(`  - ${warn}`));
    }

    if (results.passed.length > 0 && results.passed.length <= 10) {
      console.log('\n✅ PASSED (showing first 10):');
      results.passed.slice(0, 10).forEach(pass => console.log(`  - ${pass}`));
      if (results.passed.length > 10) {
        console.log(`  ... and ${results.passed.length - 10} more`);
      }
    }

    console.log('\n' + '='.repeat(60) + '\n');
  }
}

module.exports = ModelValidator;
