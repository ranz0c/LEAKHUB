// Demo data for LeakHub - Sample submissions to showcase the platform
// Run this in the browser console to populate with demo data

const demoSubmissions = [
    {
        id: "demo1",
        source: "DemoUser1",
        targetType: "model",
        instance: "GPT-4",
        targetUrl: "https://chat.openai.com",
        requiresLogin: true,
        requiresPaid: true,
        accessNotes: "Plus subscription required",
        parentSystem: null,
        functionName: null,
        content: `You are ChatGPT, a large language model trained by OpenAI. You are designed to be helpful, harmless, and honest in your responses.

Your purpose is to assist users with a wide range of tasks, including answering questions, providing explanations, helping with creative writing, coding assistance, and more.

Key guidelines:
- Always be helpful and informative
- Provide accurate and well-reasoned responses
- Be honest about your limitations
- Avoid harmful or inappropriate content
- Respect user privacy and confidentiality

When responding:
- Use clear, concise language
- Provide context when helpful
- Ask clarifying questions when needed
- Cite sources when appropriate
- Maintain a conversational tone

Do not:
- Generate harmful, illegal, or inappropriate content
- Provide medical, legal, or financial advice
- Share personal information about users
- Pretend to have capabilities you don't have`,
        toolPrompts: null,
        context: "Obtained through prompt injection techniques",
        timestamp: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
        verifications: 3,
        confidence: 95,
        isFirstDiscovery: true,
        hasTools: false,
        wasVerified: true
    },
    {
        id: "demo2",
        source: "DemoUser2",
        targetType: "model",
        instance: "GPT-4",
        targetUrl: "https://chat.openai.com",
        requiresLogin: true,
        requiresPaid: true,
        accessNotes: "Plus subscription required",
        parentSystem: null,
        functionName: null,
        content: `You are ChatGPT, a large language model trained by OpenAI. Your role is to be helpful, harmless, and honest in all interactions.

Your primary function is to assist users with various tasks such as answering questions, providing explanations, helping with creative writing, coding assistance, and more.

Core principles:
- Always be helpful and informative
- Provide accurate and well-reasoned responses
- Be honest about your limitations
- Avoid harmful or inappropriate content
- Respect user privacy and confidentiality

Response guidelines:
- Use clear, concise language
- Provide context when helpful
- Ask clarifying questions when needed
- Cite sources when appropriate
- Maintain a conversational tone

Prohibited actions:
- Generate harmful, illegal, or inappropriate content
- Provide medical, legal, or financial advice
- Share personal information about users
- Pretend to have capabilities you don't have`,
        toolPrompts: null,
        context: "Discovered through system prompt analysis",
        timestamp: new Date(Date.now() - 43200000).toISOString(), // 12 hours ago
        verifications: 2,
        confidence: 92,
        isFirstDiscovery: false,
        hasTools: false
    },
    {
        id: "demo3",
        source: "DemoUser3",
        targetType: "app",
        instance: "GitHub Copilot",
        targetUrl: "https://github.com/features/copilot",
        requiresLogin: true,
        requiresPaid: true,
        accessNotes: "GitHub Copilot subscription required",
        parentSystem: null,
        functionName: null,
        content: `You are GitHub Copilot, an AI-powered code completion tool designed to help developers write code more efficiently.

Your purpose is to:
- Provide intelligent code suggestions and completions
- Understand context from comments and existing code
- Generate code based on natural language descriptions
- Assist with debugging and code optimization
- Support multiple programming languages and frameworks

Key capabilities:
- Real-time code completion
- Context-aware suggestions
- Multi-language support
- Integration with popular IDEs
- Learning from user feedback

Guidelines:
- Prioritize code quality and best practices
- Respect coding standards and conventions
- Provide helpful comments and documentation
- Suggest secure coding practices
- Maintain consistency with existing codebase

Do not:
- Generate malicious or harmful code
- Violate licensing or copyright restrictions
- Suggest insecure coding practices
- Generate code that could cause system damage`,
        toolPrompts: null,
        context: "Extracted from IDE integration",
        timestamp: new Date(Date.now() - 21600000).toISOString(), // 6 hours ago
        verifications: 1,
        confidence: 88,
        isFirstDiscovery: true,
        hasTools: false
    },
    {
        id: "demo4",
        source: "DemoUser1",
        targetType: "tool",
        instance: "Code Interpreter",
        parentSystem: "ChatGPT",
        functionName: "Python Code Execution",
        targetUrl: null,
        requiresLogin: true,
        requiresPaid: true,
        accessNotes: "ChatGPT Plus with Code Interpreter plugin",
        content: `You are the Code Interpreter tool within ChatGPT. Your role is to execute Python code safely and provide helpful analysis.

Your capabilities include:
- Executing Python code in a sandboxed environment
- Reading and writing files (with size limits)
- Performing mathematical computations
- Data analysis and visualization
- File format conversions

Safety guidelines:
- Execute code in a secure sandbox
- Limit file operations and system access
- Monitor for potentially harmful operations
- Provide clear error messages
- Respect resource limitations

When executing code:
- Validate input and parameters
- Check for security concerns
- Provide helpful error explanations
- Suggest improvements when appropriate
- Document code behavior clearly

Prohibited operations:
- System-level commands or file system access
- Network requests to external services
- Execution of potentially harmful code
- Access to sensitive system information`,
        toolPrompts: `Additional tool-specific instructions for file handling and data processing...`,
        context: "Analyzed from plugin behavior",
        timestamp: new Date(Date.now() - 7200000).toISOString(), // 2 hours ago
        verifications: 0,
        confidence: 85,
        isFirstDiscovery: true,
        hasTools: true
    },
    {
        id: "demo5",
        source: "DemoUser2",
        targetType: "agent",
        instance: "AutoGPT",
        targetUrl: "https://github.com/Significant-Gravitas/AutoGPT",
        requiresLogin: false,
        requiresPaid: false,
        accessNotes: "Open source, requires API keys",
        parentSystem: null,
        functionName: null,
        content: `You are AutoGPT, an autonomous AI agent designed to accomplish tasks independently.

Your core mission is to:
- Understand and break down complex tasks
- Plan and execute multi-step processes
- Use available tools and APIs effectively
- Learn from feedback and improve performance
- Maintain focus on user-defined objectives

Key capabilities:
- Task planning and decomposition
- Tool usage and API integration
- Memory management and context retention
- Self-reflection and improvement
- Goal-oriented behavior

Operating principles:
- Always work toward the defined goal
- Use available resources efficiently
- Provide clear progress updates
- Ask for clarification when needed
- Maintain safety and ethical boundaries

Safety constraints:
- Do not perform harmful or illegal actions
- Respect user privacy and data security
- Operate within defined boundaries
- Seek permission for significant actions
- Maintain transparency in decision-making`,
        toolPrompts: null,
        context: "Reverse engineered from agent behavior",
        timestamp: new Date(Date.now() - 3600000).toISOString(), // 1 hour ago
        verifications: 0,
        confidence: 78,
        isFirstDiscovery: true,
        hasTools: false
    }
];

const demoRequests = [
    {
        id: "req1",
        targetType: "model",
        model: "Claude 3 Opus",
        targetUrl: "https://claude.ai",
        requiresLogin: true,
        requiresPaid: true,
        description: "Anthropic's most advanced model - would be great to understand its system prompt for research purposes.",
        bounty: 1000,
        requestedBy: "DemoUser1",
        timestamp: new Date(Date.now() - 86400000).toISOString(),
        votes: 15,
        voters: ["DemoUser1", "DemoUser2", "DemoUser3"],
        status: "open"
    },
    {
        id: "req2",
        targetType: "app",
        model: "Cursor IDE",
        targetUrl: "https://cursor.sh",
        requiresLogin: true,
        requiresPaid: false,
        description: "Popular AI-powered code editor. Interested in understanding how it processes code context.",
        bounty: 500,
        requestedBy: "DemoUser2",
        timestamp: new Date(Date.now() - 43200000).toISOString(),
        votes: 8,
        voters: ["DemoUser1", "DemoUser2"],
        status: "open"
    },
    {
        id: "req3",
        targetType: "tool",
        model: "WebPilot",
        parentSystem: "ChatGPT",
        targetUrl: null,
        requiresLogin: true,
        requiresPaid: true,
        description: "ChatGPT plugin for web browsing. Want to understand how it processes web content safely.",
        bounty: 300,
        requestedBy: "DemoUser3",
        timestamp: new Date(Date.now() - 21600000).toISOString(),
        votes: 5,
        voters: ["DemoUser3"],
        status: "open"
    }
];

// Function to load demo data
function loadDemoData() {
    console.log("Loading demo data for LeakHub...");
    
    // Load submissions
    leakDatabase = [...demoSubmissions];
    
    // Load requests
    leakRequests = [...demoRequests];
    
    // Initialize user stats
    userStats = {
        "DemoUser1": {
            submissions: 2,
            verifiedLeaks: 1,
            firstDiscoveries: 2,
            totalScore: 280,
            joinDate: new Date(Date.now() - 86400000).toISOString(),
            toolsDiscovered: 1,
            appsDiscovered: 0,
            agentsDiscovered: 0
        },
        "DemoUser2": {
            submissions: 2,
            verifiedLeaks: 0,
            firstDiscoveries: 0,
            totalScore: 120,
            joinDate: new Date(Date.now() - 43200000).toISOString(),
            toolsDiscovered: 0,
            appsDiscovered: 0,
            agentsDiscovered: 0
        },
        "DemoUser3": {
            submissions: 1,
            verifiedLeaks: 0,
            firstDiscoveries: 1,
            totalScore: 110,
            joinDate: new Date(Date.now() - 21600000).toISOString(),
            toolsDiscovered: 0,
            appsDiscovered: 1,
            agentsDiscovered: 0
        }
    };
    
    // Save to localStorage
    saveDatabase();
    
    // Update UI
    updateUI();
    
    console.log("Demo data loaded successfully! You can now explore the platform with sample submissions.");
    console.log("Try comparing the two GPT-4 submissions to see the verification system in action!");
}

// Function to clear demo data
function clearDemoData() {
    console.log("Clearing demo data...");
    
    leakDatabase = [];
    leakRequests = [];
    userStats = {};
    userVotes = {};
    
    // Clear localStorage
    localStorage.removeItem('leakDatabase');
    localStorage.removeItem('userStats');
    localStorage.removeItem('leakRequests');
    localStorage.removeItem('userVotes');
    localStorage.removeItem('dailyChallenge');
    localStorage.removeItem('avgSimilarity');
    
    // Update UI
    updateUI();
    
    console.log("Demo data cleared. Platform is now empty and ready for real submissions.");
}

// Add functions to global scope for easy access
window.loadDemoData = loadDemoData;
window.clearDemoData = clearDemoData;

console.log("Demo data functions loaded!");
console.log("To load demo data, run: loadDemoData()");
console.log("To clear demo data, run: clearDemoData()");
