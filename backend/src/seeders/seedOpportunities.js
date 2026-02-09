const mongoose = require('mongoose');
require('dotenv').config();

// Opportunity Schema
const opportunitySchema = new mongoose.Schema({
  title: { type: String, required: true },
  company: { type: String, required: true },
  description: { type: String, required: true },
  requirements: [String],
  location: { type: String, required: true },
  duration: String,
  positions: Number,
  applicationDeadline: Date,
  type: { type: String, enum: ['internship', 'industrial-attachment'] },
  category: { type: String, enum: ['IT', 'Engineering', 'Business', 'Healthcare', 'Other'] },
  status: { type: String, enum: ['active', 'closed', 'filled'], default: 'active' }
}, { timestamps: true });

const Opportunity = mongoose.model('Opportunity', opportunitySchema);

// 20 Ready-to-Use Opportunities
const opportunities = [
  {
    title: "Software Engineering Intern",
    company: "Safaricom PLC",
    description: "Join Kenya's leading telecommunications company as a software engineering intern. Work on cutting-edge mobile applications and backend systems serving millions of users across East Africa.",
    requirements: [
      "Computer Science or related degree (Year 3 or 4)",
      "Knowledge of JavaScript, React, or Node.js",
      "Strong problem-solving skills",
      "Team player with good communication",
      "Portfolio of projects (GitHub)"
    ],
    location: "Nairobi, Kenya",
    duration: "6 months",
    positions: 5,
    applicationDeadline: new Date('2026-03-31'),
    type: "internship",
    category: "IT",
    status: "active"
  },
  {
    title: "Electrical Engineering Attachment",
    company: "Kenya Power & Lighting Co.",
    description: "Gain hands-on experience in power distribution and electrical systems maintenance across Kenya's national grid. Work with experienced engineers on real-world projects.",
    requirements: [
      "Electrical Engineering student (Year 3 or 4)",
      "Understanding of power systems",
      "Safety conscious with attention to detail",
      "Valid ID and clearance certificate",
      "Willing to work in field conditions"
    ],
    location: "Nairobi & Multiple Locations",
    duration: "3 months",
    positions: 10,
    applicationDeadline: new Date('2026-04-15'),
    type: "industrial-attachment",
    category: "Engineering",
    status: "active"
  },
  {
    title: "Data Analyst Internship",
    company: "Equity Bank Kenya",
    description: "Work with our analytics team to derive insights from customer data and support data-driven decision making. Learn from industry experts in financial analytics.",
    requirements: [
      "Statistics, Mathematics, or Computer Science background",
      "Proficiency in Excel, SQL, Python or R",
      "Data visualization skills (Tableau, Power BI)",
      "Analytical mindset with attention to detail",
      "Strong presentation skills"
    ],
    location: "Nairobi, Kenya",
    duration: "4 months",
    positions: 3,
    applicationDeadline: new Date('2026-03-20'),
    type: "internship",
    category: "IT",
    status: "active"
  },
  {
    title: "Marketing & Communications Intern",
    company: "KCB Bank Group",
    description: "Support our marketing campaigns and digital communication strategies across East Africa. Create content for social media, website, and customer campaigns.",
    requirements: [
      "Marketing, Communications, or Business degree",
      "Social media savvy (Instagram, Twitter, LinkedIn)",
      "Excellent written and verbal communication",
      "Creative thinking and content creation",
      "Graphic design skills (bonus)"
    ],
    location: "Nairobi, Kenya",
    duration: "6 months",
    positions: 4,
    applicationDeadline: new Date('2026-04-30'),
    type: "internship",
    category: "Business",
    status: "active"
  },
  {
    title: "Mechanical Engineering Attachment",
    company: "East African Breweries Limited",
    description: "Industrial attachment in our manufacturing plants. Learn about production machinery, maintenance schedules, and quality control processes in beverage manufacturing.",
    requirements: [
      "Mechanical Engineering student",
      "Basic AutoCAD knowledge",
      "Interest in manufacturing processes",
      "Willingness to work in industrial environment",
      "Safety awareness"
    ],
    location: "Ruaraka, Nairobi",
    duration: "3 months",
    positions: 6,
    applicationDeadline: new Date('2026-03-25'),
    type: "industrial-attachment",
    category: "Engineering",
    status: "active"
  },
  {
    title: "Web Developer Internship",
    company: "Andela Kenya",
    description: "Build web applications using modern technologies. Mentorship from senior developers included. Work on real client projects and build your portfolio.",
    requirements: [
      "Computer Science or self-taught developer",
      "HTML, CSS, JavaScript proficiency",
      "React or Vue.js experience (bonus)",
      "Portfolio of personal projects",
      "Problem-solving skills"
    ],
    location: "Remote/Nairobi",
    duration: "6 months",
    positions: 8,
    applicationDeadline: new Date('2026-04-10'),
    type: "internship",
    category: "IT",
    status: "active"
  },
  {
    title: "Civil Engineering Attachment",
    company: "China Road and Bridge Corporation",
    description: "Work on major infrastructure projects including roads, bridges, and buildings across Kenya. Learn modern construction techniques and project management.",
    requirements: [
      "Civil Engineering student (Year 3+)",
      "Knowledge of construction materials",
      "Ability to read architectural drawings",
      "Field work ready",
      "Team collaboration skills"
    ],
    location: "Nairobi & Mombasa",
    duration: "4 months",
    positions: 12,
    applicationDeadline: new Date('2026-03-15'),
    type: "industrial-attachment",
    category: "Engineering",
    status: "active"
  },
  {
    title: "UI/UX Design Intern",
    company: "Twiga Foods",
    description: "Design user interfaces for our mobile and web platforms connecting farmers to retailers. Create wireframes, prototypes, and conduct user research.",
    requirements: [
      "Design background or strong portfolio",
      "Figma or Adobe XD proficiency",
      "Understanding of user-centered design",
      "Creative problem solver",
      "Communication skills for presenting designs"
    ],
    location: "Nairobi, Kenya",
    duration: "5 months",
    positions: 2,
    applicationDeadline: new Date('2026-04-05'),
    type: "internship",
    category: "IT",
    status: "active"
  },
  {
    title: "Accounting & Finance Attachment",
    company: "PricewaterhouseCoopers (PwC) Kenya",
    description: "Gain exposure to audit, tax, and advisory services in one of the Big 4 accounting firms. Work with multinational clients and learn professional standards.",
    requirements: [
      "Accounting, Finance, or Business degree",
      "CPA Part I (advantageous)",
      "Proficiency in MS Excel",
      "High attention to detail",
      "Professional ethics and confidentiality"
    ],
    location: "Nairobi, Kenya",
    duration: "6 months",
    positions: 15,
    applicationDeadline: new Date('2026-03-10'),
    type: "industrial-attachment",
    category: "Business",
    status: "active"
  },
  {
    title: "Cybersecurity Intern",
    company: "Liquid Intelligent Technologies",
    description: "Learn about network security, threat detection, and security operations center (SOC) operations. Hands-on experience with security tools and incident response.",
    requirements: [
      "IT, Computer Science, or Cybersecurity student",
      "Understanding of networking basics (TCP/IP, DNS)",
      "Interest in ethical hacking",
      "Security certifications like CompTIA Security+ (bonus)",
      "Analytical thinking"
    ],
    location: "Nairobi, Kenya",
    duration: "4 months",
    positions: 3,
    applicationDeadline: new Date('2026-04-20'),
    type: "internship",
    category: "IT",
    status: "active"
  },
  {
    title: "Mobile App Developer Intern",
    company: "M-KOPA Solar",
    description: "Develop Android/iOS applications for our solar financing platform reaching millions across Africa. Work with cutting-edge mobile technologies and fintech.",
    requirements: [
      "Experience with React Native, Flutter, or native development",
      "Understanding of mobile UI/UX principles",
      "API integration experience",
      "Passion for renewable energy and social impact",
      "Problem-solving skills"
    ],
    location: "Nairobi, Kenya",
    duration: "6 months",
    positions: 4,
    applicationDeadline: new Date('2026-03-28'),
    type: "internship",
    category: "IT",
    status: "active"
  },
  {
    title: "Human Resources Attachment",
    company: "Safaricom PLC",
    description: "Support recruitment, training, and employee engagement initiatives in our HR department. Learn about talent acquisition and people management.",
    requirements: [
      "Human Resource Management student",
      "Good interpersonal skills",
      "MS Office proficiency (Excel, Word, PowerPoint)",
      "Confidentiality and professionalism",
      "Organizational skills"
    ],
    location: "Nairobi, Kenya",
    duration: "5 months",
    positions: 3,
    applicationDeadline: new Date('2026-04-12'),
    type: "industrial-attachment",
    category: "Business",
    status: "active"
  },
  {
    title: "DevOps Engineering Intern",
    company: "Cellulant Corporation",
    description: "Work with cloud infrastructure, CI/CD pipelines, and container orchestration. Learn AWS, Docker, Kubernetes, and modern DevOps practices.",
    requirements: [
      "Computer Science or IT background",
      "Linux/Unix command line knowledge",
      "Understanding of Docker and Kubernetes",
      "Scripting skills (Bash, Python)",
      "Problem-solving mindset"
    ],
    location: "Nairobi, Kenya",
    duration: "6 months",
    positions: 2,
    applicationDeadline: new Date('2026-03-30'),
    type: "internship",
    category: "IT",
    status: "active"
  },
  {
    title: "Chemical Engineering Attachment",
    company: "Bamburi Cement",
    description: "Hands-on experience in cement production, quality control, and process optimization. Learn about chemical processes in industrial manufacturing.",
    requirements: [
      "Chemical Engineering student",
      "Understanding of chemical processes",
      "Lab safety awareness and protocols",
      "Team collaboration skills",
      "Interest in manufacturing"
    ],
    location: "Mombasa, Kenya",
    duration: "3 months",
    positions: 5,
    applicationDeadline: new Date('2026-03-18'),
    type: "industrial-attachment",
    category: "Engineering",
    status: "active"
  },
  {
    title: "Graphic Design Intern",
    company: "Nation Media Group",
    description: "Create visual content for print and digital media including newspapers, magazines, and online platforms. Work with professional designers on national campaigns.",
    requirements: [
      "Design portfolio required (PDF or online)",
      "Adobe Creative Suite (Photoshop, Illustrator, InDesign)",
      "Understanding of typography and layout",
      "Creative and deadline-oriented",
      "Knowledge of print and digital media"
    ],
    location: "Nairobi, Kenya",
    duration: "4 months",
    positions: 3,
    applicationDeadline: new Date('2026-04-08'),
    type: "internship",
    category: "Other",
    status: "active"
  },
  {
    title: "Business Analyst Attachment",
    company: "Cooperative Bank of Kenya",
    description: "Analyze business processes, gather requirements, and support digital transformation projects. Learn business intelligence and process improvement.",
    requirements: [
      "Business, IT, or related degree",
      "Analytical and problem-solving skills",
      "Basic SQL knowledge",
      "Report writing and presentation skills",
      "MS Excel and PowerPoint proficiency"
    ],
    location: "Nairobi, Kenya",
    duration: "5 months",
    positions: 4,
    applicationDeadline: new Date('2026-03-22'),
    type: "industrial-attachment",
    category: "Business",
    status: "active"
  },
  {
    title: "Telecommunications Engineering Intern",
    company: "Airtel Kenya",
    description: "Learn about mobile network infrastructure, tower maintenance, and RF optimization. Hands-on experience with telecommunications equipment.",
    requirements: [
      "Telecommunications or Electrical Engineering",
      "Understanding of wireless communication",
      "Willingness for field work",
      "Valid driving license (advantageous)",
      "Technical aptitude"
    ],
    location: "Nairobi & Upcountry",
    duration: "4 months",
    positions: 8,
    applicationDeadline: new Date('2026-04-18'),
    type: "internship",
    category: "Engineering",
    status: "active"
  },
  {
    title: "Supply Chain & Logistics Attachment",
    company: "Unilever Kenya",
    description: "Experience in procurement, inventory management, and distribution logistics for FMCG products. Learn supply chain optimization and operations management.",
    requirements: [
      "Supply Chain, Business, or Engineering student",
      "Analytical skills",
      "MS Excel proficiency (VLOOKUP, Pivot Tables)",
      "Interest in operations management",
      "Attention to detail"
    ],
    location: "Industrial Area, Nairobi",
    duration: "3 months",
    positions: 5,
    applicationDeadline: new Date('2026-03-26'),
    type: "industrial-attachment",
    category: "Business",
    status: "active"
  },
  {
    title: "Fullstack Developer Internship",
    company: "iProcure",
    description: "Build end-to-end features for our agricultural e-commerce platform using modern tech stack. Work on both frontend and backend development.",
    requirements: [
      "JavaScript/TypeScript proficiency",
      "React and Node.js experience",
      "Database knowledge (MongoDB or PostgreSQL)",
      "RESTful API development",
      "Git version control"
    ],
    location: "Nairobi, Kenya",
    duration: "6 months",
    positions: 3,
    applicationDeadline: new Date('2026-04-02'),
    type: "internship",
    category: "IT",
    status: "active"
  },
  {
    title: "Journalism & Media Production Intern",
    company: "Citizen TV - Royal Media Services",
    description: "Work with our news team in reporting, video production, and digital content creation. Learn broadcast journalism and multimedia storytelling.",
    requirements: [
      "Journalism, Media, or Communications student",
      "Video editing skills (Premiere Pro, Final Cut)",
      "Strong writing and storytelling skills",
      "Camera operation knowledge (bonus)",
      "Current events awareness"
    ],
    location: "Nairobi, Kenya",
    duration: "4 months",
    positions: 6,
    applicationDeadline: new Date('2026-04-25'),
    type: "internship",
    category: "Other",
    status: "active"
  }
];

async function seedDatabase() {
  try {
    // Connect to MongoDB
    const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/industrial-attachment';
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB');

    // Clear existing opportunities
    await Opportunity.deleteMany({});
    console.log('🗑️  Cleared existing opportunities');

    // Insert new opportunities
    const inserted = await Opportunity.insertMany(opportunities);
    console.log(`✅ Successfully seeded ${inserted.length} opportunities!`);

    // Display summary
    console.log('\n📊 Seed Data Summary:');
    console.log(`   Total Opportunities: ${inserted.length}`);
    console.log(`   IT Positions: ${inserted.filter(o => o.category === 'IT').length}`);
    console.log(`   Engineering Positions: ${inserted.filter(o => o.category === 'Engineering').length}`);
    console.log(`   Business Positions: ${inserted.filter(o => o.category === 'Business').length}`);
    console.log(`   Other Positions: ${inserted.filter(o => o.category === 'Other').length}`);
    console.log(`   Internships: ${inserted.filter(o => o.type === 'internship').length}`);
    console.log(`   Industrial Attachments: ${inserted.filter(o => o.type === 'industrial-attachment').length}`);
    
    console.log('\n🎉 Database seeded successfully! You can now test the application.');
    console.log('\n💡 Next steps:');
    console.log('   1. Start the backend: npm run dev');
    console.log('   2. Start the frontend: cd ../frontend && npm run dev');
    console.log('   3. Open http://localhost:3000 in your browser');
    console.log('   4. Browse opportunities and test the application!');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
}

// Run the seeder
seedDatabase();
