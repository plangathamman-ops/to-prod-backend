const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// Import models
const User = require('../models/User');
const Opportunity = require('../models/Opportunity');

// Sample Admin User
const adminUser = {
  firstName: "Admin",
  lastName: "System",
  email: "admin@ias.com",
  phoneNumber: "254712345678",
  password: "Admin@123",
  institution: "IAS System",
  course: "System Administration",
  yearOfStudy: "N/A",
  role: "admin"
};

// Sample Student User for Testing
const testStudent = {
  firstName: "John",
  lastName: "Doe",
  email: "student@test.com",
  phoneNumber: "254700123456",
  password: "Student@123",
  institution: "University of Nairobi",
  course: "Computer Science",
  yearOfStudy: "Year 4",
  role: "student"
};

// 20 Ready-to-Use Opportunities
const opportunities = [
  {
    title: "Software Engineering Intern",
    company: "Safaricom PLC",
    description: "Join Kenya's leading telecommunications company as a software engineering intern. Work on cutting-edge mobile applications and backend systems serving millions of users across East Africa. You'll collaborate with experienced developers on real-world projects using modern technologies.",
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
    description: "Gain hands-on experience in power distribution and electrical systems maintenance across Kenya's national grid. Work with experienced engineers on real-world projects including substation maintenance, power line installation, and fault detection.",
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
    description: "Work with our analytics team to derive insights from customer data and support data-driven decision making. Learn from industry experts in financial analytics and contribute to real business intelligence projects.",
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
    description: "Support our marketing campaigns and digital communication strategies across East Africa. Create content for social media, website, and customer campaigns. Learn digital marketing best practices.",
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
    description: "Industrial attachment in our manufacturing plants. Learn about production machinery, maintenance schedules, and quality control processes in beverage manufacturing. Hands-on experience with industrial equipment.",
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
    description: "Build web applications using modern technologies. Mentorship from senior developers included. Work on real client projects and build your portfolio while learning industry best practices.",
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
    description: "Work on major infrastructure projects including roads, bridges, and buildings across Kenya. Learn modern construction techniques and project management from international experts.",
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
    description: "Design user interfaces for our mobile and web platforms connecting farmers to retailers. Create wireframes, prototypes, and conduct user research to improve user experience.",
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
    description: "Gain exposure to audit, tax, and advisory services in one of the Big 4 accounting firms. Work with multinational clients and learn professional standards in accounting and finance.",
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
    description: "Learn about network security, threat detection, and security operations center (SOC) operations. Hands-on experience with security tools and incident response procedures.",
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
    description: "Develop Android/iOS applications for our solar financing platform reaching millions across Africa. Work with cutting-edge mobile technologies and contribute to clean energy access.",
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
    description: "Support recruitment, training, and employee engagement initiatives in our HR department. Learn about talent acquisition, performance management, and people development.",
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
    description: "Work with cloud infrastructure, CI/CD pipelines, and container orchestration. Learn AWS, Docker, Kubernetes, and modern DevOps practices in a fintech environment.",
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
    description: "Hands-on experience in cement production, quality control, and process optimization. Learn about chemical processes in industrial manufacturing and quality assurance.",
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
    description: "Analyze business processes, gather requirements, and support digital transformation projects. Learn business intelligence and process improvement methodologies.",
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
    description: "Learn about mobile network infrastructure, tower maintenance, and RF optimization. Hands-on experience with telecommunications equipment and network monitoring.",
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
    description: "Build end-to-end features for our agricultural e-commerce platform using modern tech stack. Work on both frontend and backend development with mentorship.",
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
    description: "Work with our news team in reporting, video production, and digital content creation. Learn broadcast journalism and multimedia storytelling from professionals.",
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
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB successfully!\n');

    // Clear existing data
    console.log('🗑️  Clearing existing data...');
    await User.deleteMany({});
    await Opportunity.deleteMany({});
    console.log('✅ Existing data cleared\n');

    // Hash passwords
    console.log('🔐 Hashing passwords...');
    adminUser.password = await bcrypt.hash(adminUser.password, 10);
    testStudent.password = await bcrypt.hash(testStudent.password, 10);

    // Insert users
    console.log('👥 Creating users...');
    const [admin, student] = await User.insertMany([adminUser, testStudent]);
    console.log(`✅ Created admin user: ${admin.email}`);
    console.log(`✅ Created test student: ${student.email}\n`);

    // Insert opportunities
    console.log('💼 Creating opportunities...');
    const inserted = await Opportunity.insertMany(opportunities);
    console.log(`✅ Successfully seeded ${inserted.length} opportunities!\n`);

    // Display summary
    console.log('═══════════════════════════════════════════════════════════');
    console.log('📊 SEED DATA SUMMARY');
    console.log('═══════════════════════════════════════════════════════════');
    console.log(`\n👤 USERS CREATED:`);
    console.log(`   Admin:    ${admin.email} / Admin@123`);
    console.log(`   Student:  ${student.email} / Student@123`);
    
    console.log(`\n💼 OPPORTUNITIES CREATED: ${inserted.length} total`);
    console.log(`   📱 IT:          ${inserted.filter(o => o.category === 'IT').length} positions`);
    console.log(`   ⚙️  Engineering: ${inserted.filter(o => o.category === 'Engineering').length} positions`);
    console.log(`   💼 Business:    ${inserted.filter(o => o.category === 'Business').length} positions`);
    console.log(`   📝 Other:       ${inserted.filter(o => o.category === 'Other').length} positions`);
    
    console.log(`\n🎯 BY TYPE:`);
    console.log(`   Internships:            ${inserted.filter(o => o.type === 'internship').length}`);
    console.log(`   Industrial Attachments: ${inserted.filter(o => o.type === 'industrial-attachment').length}`);
    
    console.log(`\n🏢 FEATURED COMPANIES:`);
    const companies = [...new Set(inserted.map(o => o.company))];
    companies.slice(0, 10).forEach(company => {
      console.log(`   • ${company}`);
    });
    if (companies.length > 10) {
      console.log(`   ... and ${companies.length - 10} more!`);
    }
    
    console.log('\n═══════════════════════════════════════════════════════════');
    console.log('🎉 DATABASE SEEDED SUCCESSFULLY!');
    console.log('═══════════════════════════════════════════════════════════');
    console.log('\n💡 NEXT STEPS:');
    console.log('   1. Start the backend:  npm run dev');
    console.log('   2. Start the frontend: cd ../frontend && npm run dev');
    console.log('   3. Open: http://localhost:3000');
    console.log('   4. Login with student@test.com / Student@123');
    console.log('   5. Browse 20 opportunities and apply!');
    console.log('\n═══════════════════════════════════════════════════════════\n');

    process.exit(0);
  } catch (error) {
    console.error('\n❌ ERROR SEEDING DATABASE:', error.message);
    console.error('\n💡 Make sure MongoDB is running:');
    console.error('   brew services start mongodb-community (Mac)');
    console.error('   sudo systemctl start mongod (Linux)');
    console.error('   Or use MongoDB Atlas cloud database\n');
    process.exit(1);
  }
}

// Run the seeder
seedDatabase();
