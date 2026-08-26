const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

const Component = require('./models/component.model');
const Relationship = require('./models/relationship.model');
const Project = require('./models/project.model');
const Workspace = require('./models/workspace.model');
const User = require('./models/user.model');
const Team = require('./models/teams.model');

async function seedComponents() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    const workspace = await Workspace.findOne({ name: 'Capstone' });
    if (!workspace) throw new Error('Capstone workspace not found');

    const project = await Project.findOne({ 
      workspaceId: workspace._id,
      name: { $regex: /Digilians Capstone/i }
    });
    if (!project) throw new Error('Digilians Capstone project not found');

    const adminUser = await User.findOne({ role: 'admin' }) || await User.findOne();
    const techLeadUser = await User.findOne({ role: 'techLead' }) || adminUser;
    const regularUsers = await User.find({ role: 'user' });
    let maintainerIds = regularUsers.map(u => u._id);
    if (maintainerIds.length === 0) maintainerIds.push(adminUser._id);

    const team = await Team.findOne({ teamName: 'Platform Dev' }) || await Team.findOne() || null;
    const teamId = team ? team._id : null;

    console.log('Target Workspace:', workspace.name, workspace._id);
    console.log('Target Project:', project.name, project._id);
    console.log('Curator User:', adminUser.email, adminUser._id);
    console.log('Tech Lead:', techLeadUser.email, techLeadUser._id);

    const newComponentsData = [
      {
        name: 'System Atlas Web App',
        description: 'Modern single-page application and architecture dashboard providing interactive component maps, dependency graphs, and team management views.',
        projectId: project._id,
        type: 'frontend',
        technologies: ['React', 'JavaScript', 'Vite', 'Tailwind CSS', 'Redux Toolkit'],
        ownerTeam: teamId,
        technicalLead: techLeadUser._id,
        maintainers: maintainerIds.slice(0, 3),
        tags: ['frontend', 'ui', 'dashboard', 'spa', 'react'],
        documentation: {
          repoURL: 'https://github.com/muhammadRashwan1101/System-atlas',
          docsURL: 'https://github.com/muhammadRashwan1101/System-atlas',
          monitorURL: 'https://status.systematlas.io',
          deploymentURL: 'https://app.systematlas.io',
          tags: ['frontend', 'ui', 'dashboard', 'spa', 'react']
        },
        status: 'active',
        deploymentEnvironment: 'development',
        createdBy: adminUser._id
      },
      {
        name: 'API Gateway Service',
        description: 'Core ingress reverse proxy and routing gateway managing request validation, rate limiting, JWT token verification, and microservice traffic dispatching.',
        projectId: project._id,
        type: 'api-gateway',
        technologies: ['Node.js', 'Express', 'Nginx', 'Redis'],
        ownerTeam: teamId,
        technicalLead: techLeadUser._id,
        maintainers: maintainerIds.slice(0, 2),
        tags: ['api-gateway', 'routing', 'ingress', 'security', 'rate-limiting'],
        documentation: {
          repoURL: 'https://github.com/muhammadRashwan1101/system-atlas-BackEnd',
          docsURL: 'https://github.com/muhammadRashwan1101/system-atlas-BackEnd',
          tags: ['api-gateway', 'routing', 'ingress']
        },
        status: 'active',
        deploymentEnvironment: 'development',
        createdBy: adminUser._id
      },
      {
        name: 'Workspace & Team Service',
        description: 'Dedicated domain microservice providing multi-tenant workspace orchestration, team hierarchy management, user onboarding, and role-based permissions.',
        projectId: project._id,
        type: 'backend',
        technologies: ['Node.js', 'Express', 'MongoDB', 'Mongoose', 'Joi'],
        ownerTeam: teamId,
        technicalLead: techLeadUser._id,
        maintainers: maintainerIds.slice(0, 2),
        tags: ['backend', 'workspaces', 'teams', 'rbac', 'microservice'],
        documentation: {
          repoURL: 'https://github.com/muhammadRashwan1101/system-atlas-BackEnd',
          docsURL: 'https://github.com/muhammadRashwan1101/system-atlas-BackEnd',
          tags: ['backend', 'workspaces', 'teams']
        },
        status: 'active',
        deploymentEnvironment: 'development',
        createdBy: adminUser._id
      },
      {
        name: 'Primary MongoDB Cluster',
        description: 'Distributed replica set database storing core domain aggregates including workspaces, system projects, architecture components, and relationships.',
        projectId: project._id,
        type: 'database',
        technologies: ['MongoDB', 'Mongoose', 'NoSQL', 'ReplicaSet'],
        ownerTeam: teamId,
        technicalLead: techLeadUser._id,
        maintainers: maintainerIds.slice(0, 2),
        tags: ['database', 'nosql', 'mongodb', 'persistence', 'storage'],
        documentation: {
          repoURL: 'https://github.com/muhammadRashwan1101/system-atlas-BackEnd',
          docsURL: 'https://docs.mongodb.com',
          tags: ['database', 'nosql', 'storage']
        },
        status: 'active',
        deploymentEnvironment: 'development',
        createdBy: adminUser._id
      },
      {
        name: 'Redis Cache & Session Store',
        description: 'High-throughput in-memory caching engine used for distributed session storage, token blacklisting, and rapid query response caching.',
        projectId: project._id,
        type: 'cache',
        technologies: ['Redis', 'In-Memory', 'Key-Value Store'],
        ownerTeam: teamId,
        technicalLead: techLeadUser._id,
        maintainers: maintainerIds.slice(0, 1),
        tags: ['cache', 'redis', 'sessions', 'performance'],
        documentation: {
          repoURL: 'https://github.com/muhammadRashwan1101/system-atlas-BackEnd',
          docsURL: 'https://redis.io/docs',
          tags: ['cache', 'redis']
        },
        status: 'active',
        deploymentEnvironment: 'development',
        createdBy: adminUser._id
      },
      {
        name: 'Event Bus & Notification Queue',
        description: 'AMQP asynchronous message broker managing event publishing, background notifications, webhook deliveries, and audit log processing.',
        projectId: project._id,
        type: 'queue',
        technologies: ['RabbitMQ', 'AMQP', 'Node.js'],
        ownerTeam: teamId,
        technicalLead: techLeadUser._id,
        maintainers: maintainerIds.slice(0, 2),
        tags: ['queue', 'rabbitmq', 'events', 'async', 'notifications'],
        documentation: {
          repoURL: 'https://github.com/muhammadRashwan1101/system-atlas-BackEnd',
          docsURL: 'https://www.rabbitmq.com/documentation.html',
          tags: ['queue', 'events']
        },
        status: 'active',
        deploymentEnvironment: 'development',
        createdBy: adminUser._id
      },
      {
        name: 'Architecture Analytics AI Engine',
        description: 'Machine learning and graph intelligence service that inspects component dependency topologies to detect architectural anti-patterns and circular flows.',
        projectId: project._id,
        type: 'Data Science',
        technologies: ['Python', 'FastAPI', 'NetworkX', 'PyTorch', 'NumPy'],
        ownerTeam: teamId,
        technicalLead: techLeadUser._id,
        maintainers: maintainerIds.slice(0, 2),
        tags: ['ai', 'datascience', 'graph-analytics', 'python', 'fastapi'],
        documentation: {
          repoURL: 'https://github.com/muhammadRashwan1101/system-atlas-BackEnd',
          docsURL: 'https://fastapi.tiangolo.com',
          tags: ['ai', 'datascience', 'analytics']
        },
        status: 'active',
        deploymentEnvironment: 'development',
        createdBy: adminUser._id
      },
      {
        name: 'Cloud Infrastructure & CI/CD',
        description: 'Automated containerized cloud infrastructure, Terraform orchestration, Docker packaging, and GitHub Actions continuous integration pipelines.',
        projectId: project._id,
        type: 'cloud-service',
        technologies: ['AWS ECS', 'Docker', 'Terraform', 'GitHub Actions', 'Linux'],
        ownerTeam: teamId,
        technicalLead: techLeadUser._id,
        maintainers: maintainerIds.slice(0, 2),
        tags: ['cloud', 'aws', 'docker', 'devops', 'ci-cd'],
        documentation: {
          repoURL: 'https://github.com/muhammadRashwan1101/System-atlas',
          docsURL: 'https://aws.amazon.com/ecs/',
          tags: ['cloud', 'devops', 'ci-cd']
        },
        status: 'active',
        deploymentEnvironment: 'development',
        createdBy: adminUser._id
      }
    ];

    for (const compData of newComponentsData) {
      let existing = await Component.findOne({ projectId: project._id, name: compData.name });
      if (!existing) {
        existing = await Component.create(compData);
        console.log('✓ Created component:', compData.name, 'ID:', existing._id);
      } else {
        console.log('ℹ Existing component found:', compData.name, 'ID:', existing._id);
      }
    }

    // Fetch existing components to connect relationships
    const allProjectComps = await Component.find({ projectId: project._id });
    const compMap = {};
    allProjectComps.forEach(c => {
      compMap[c.name] = c._id;
    });

    const relationshipsToCreate = [
      { sourceName: 'System Atlas Web App', targetName: 'API Gateway Service', type: 'calls', protocol: 'HTTPS' },
      { sourceName: 'API Gateway Service', targetName: 'Authentication', type: 'calls', protocol: 'HTTPS' },
      { sourceName: 'API Gateway Service', targetName: 'Project Service', type: 'calls', protocol: 'HTTPS' },
      { sourceName: 'API Gateway Service', targetName: 'Payment', type: 'calls', protocol: 'HTTPS' },
      { sourceName: 'API Gateway Service', targetName: 'Workspace & Team Service', type: 'calls', protocol: 'HTTPS' },
      { sourceName: 'Authentication', targetName: 'Redis Cache & Session Store', type: 'reads-from', protocol: 'HTTPS' },
      { sourceName: 'Authentication', targetName: 'Primary MongoDB Cluster', type: 'writes-to', protocol: 'HTTPS' },
      { sourceName: 'Project Service', targetName: 'Primary MongoDB Cluster', type: 'reads-from', protocol: 'HTTPS' },
      { sourceName: 'Workspace & Team Service', targetName: 'Primary MongoDB Cluster', type: 'writes-to', protocol: 'HTTPS' },
      { sourceName: 'Payment', targetName: 'Event Bus & Notification Queue', type: 'publishes-to', protocol: 'AMQP' },
      { sourceName: 'Project Service', targetName: 'Event Bus & Notification Queue', type: 'consumes-from', protocol: 'AMQP' },
      { sourceName: 'Architecture Analytics AI Engine', targetName: 'Primary MongoDB Cluster', type: 'reads-from', protocol: 'HTTPS' },
      { sourceName: 'System Atlas Web App', targetName: 'Cloud Infrastructure & CI/CD', type: 'depends-on', protocol: 'HTTPS' }
    ];

    for (const rel of relationshipsToCreate) {
      const sourceId = compMap[rel.sourceName];
      const targetId = compMap[rel.targetName];
      if (sourceId && targetId) {
        const exists = await Relationship.findOne({
          projectId: project._id,
          sourceId,
          targetId,
          type: rel.type,
          protocol: rel.protocol
        });
        if (!exists) {
          await Relationship.create({
            projectId: project._id,
            sourceId,
            targetId,
            type: rel.type,
            protocol: rel.protocol
          });
          console.log(`✓ Created relationship: ${rel.sourceName} --[${rel.type} (${rel.protocol})]--> ${rel.targetName}`);
        } else {
          console.log(`ℹ Relationship already exists: ${rel.sourceName} -> ${rel.targetName}`);
        }
      }
    }

    const finalComps = await Component.find({ projectId: project._id });
    const finalRels = await Relationship.find({ projectId: project._id });
    console.log('==============================================');
    console.log('Total components in Digilians Capstone:', finalComps.length);
    console.log('Total relationships in Digilians Capstone:', finalRels.length);
    console.log('==============================================');

    process.exit(0);
  } catch (err) {
    console.error('Error seeding components:', err);
    process.exit(1);
  }
}

seedComponents();
