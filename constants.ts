import { InterviewType, InterviewConfig } from './types';

// NeetCode 150 Problems List
export interface LeetCodeProblem {
  id: number;
  name: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  category: string;
}

export const NEETCODE_150: LeetCodeProblem[] = [
  // Arrays & Hashing
  { id: 217, name: "Contains Duplicate", difficulty: "Easy", category: "Arrays & Hashing" },
  { id: 242, name: "Valid Anagram", difficulty: "Easy", category: "Arrays & Hashing" },
  { id: 1, name: "Two Sum", difficulty: "Easy", category: "Arrays & Hashing" },
  { id: 49, name: "Group Anagrams", difficulty: "Medium", category: "Arrays & Hashing" },
  { id: 347, name: "Top K Frequent Elements", difficulty: "Medium", category: "Arrays & Hashing" },
  { id: 238, name: "Product of Array Except Self", difficulty: "Medium", category: "Arrays & Hashing" },
  { id: 36, name: "Valid Sudoku", difficulty: "Medium", category: "Arrays & Hashing" },
  { id: 128, name: "Longest Consecutive Sequence", difficulty: "Medium", category: "Arrays & Hashing" },
  
  // Two Pointers
  { id: 125, name: "Valid Palindrome", difficulty: "Easy", category: "Two Pointers" },
  { id: 167, name: "Two Sum II", difficulty: "Medium", category: "Two Pointers" },
  { id: 15, name: "3Sum", difficulty: "Medium", category: "Two Pointers" },
  { id: 11, name: "Container With Most Water", difficulty: "Medium", category: "Two Pointers" },
  { id: 42, name: "Trapping Rain Water", difficulty: "Hard", category: "Two Pointers" },
  
  // Sliding Window
  { id: 121, name: "Best Time to Buy and Sell Stock", difficulty: "Easy", category: "Sliding Window" },
  { id: 3, name: "Longest Substring Without Repeating Characters", difficulty: "Medium", category: "Sliding Window" },
  { id: 424, name: "Longest Repeating Character Replacement", difficulty: "Medium", category: "Sliding Window" },
  { id: 567, name: "Permutation in String", difficulty: "Medium", category: "Sliding Window" },
  { id: 76, name: "Minimum Window Substring", difficulty: "Hard", category: "Sliding Window" },
  { id: 239, name: "Sliding Window Maximum", difficulty: "Hard", category: "Sliding Window" },
  
  // Stack
  { id: 20, name: "Valid Parentheses", difficulty: "Easy", category: "Stack" },
  { id: 155, name: "Min Stack", difficulty: "Medium", category: "Stack" },
  { id: 150, name: "Evaluate Reverse Polish Notation", difficulty: "Medium", category: "Stack" },
  { id: 22, name: "Generate Parentheses", difficulty: "Medium", category: "Stack" },
  { id: 739, name: "Daily Temperatures", difficulty: "Medium", category: "Stack" },
  { id: 853, name: "Car Fleet", difficulty: "Medium", category: "Stack" },
  { id: 84, name: "Largest Rectangle in Histogram", difficulty: "Hard", category: "Stack" },
  
  // Binary Search
  { id: 704, name: "Binary Search", difficulty: "Easy", category: "Binary Search" },
  { id: 74, name: "Search a 2D Matrix", difficulty: "Medium", category: "Binary Search" },
  { id: 875, name: "Koko Eating Bananas", difficulty: "Medium", category: "Binary Search" },
  { id: 33, name: "Search in Rotated Sorted Array", difficulty: "Medium", category: "Binary Search" },
  { id: 153, name: "Find Minimum in Rotated Sorted Array", difficulty: "Medium", category: "Binary Search" },
  { id: 981, name: "Time Based Key-Value Store", difficulty: "Medium", category: "Binary Search" },
  { id: 4, name: "Median of Two Sorted Arrays", difficulty: "Hard", category: "Binary Search" },
  
  // Linked List
  { id: 206, name: "Reverse Linked List", difficulty: "Easy", category: "Linked List" },
  { id: 21, name: "Merge Two Sorted Lists", difficulty: "Easy", category: "Linked List" },
  { id: 143, name: "Reorder List", difficulty: "Medium", category: "Linked List" },
  { id: 19, name: "Remove Nth Node From End of List", difficulty: "Medium", category: "Linked List" },
  { id: 138, name: "Copy List with Random Pointer", difficulty: "Medium", category: "Linked List" },
  { id: 2, name: "Add Two Numbers", difficulty: "Medium", category: "Linked List" },
  { id: 141, name: "Linked List Cycle", difficulty: "Easy", category: "Linked List" },
  { id: 287, name: "Find the Duplicate Number", difficulty: "Medium", category: "Linked List" },
  { id: 146, name: "LRU Cache", difficulty: "Medium", category: "Linked List" },
  { id: 23, name: "Merge K Sorted Lists", difficulty: "Hard", category: "Linked List" },
  { id: 25, name: "Reverse Nodes in K-Group", difficulty: "Hard", category: "Linked List" },
  
  // Trees
  { id: 226, name: "Invert Binary Tree", difficulty: "Easy", category: "Trees" },
  { id: 104, name: "Maximum Depth of Binary Tree", difficulty: "Easy", category: "Trees" },
  { id: 543, name: "Diameter of Binary Tree", difficulty: "Easy", category: "Trees" },
  { id: 110, name: "Balanced Binary Tree", difficulty: "Easy", category: "Trees" },
  { id: 100, name: "Same Tree", difficulty: "Easy", category: "Trees" },
  { id: 572, name: "Subtree of Another Tree", difficulty: "Easy", category: "Trees" },
  { id: 235, name: "Lowest Common Ancestor of a BST", difficulty: "Medium", category: "Trees" },
  { id: 102, name: "Binary Tree Level Order Traversal", difficulty: "Medium", category: "Trees" },
  { id: 199, name: "Binary Tree Right Side View", difficulty: "Medium", category: "Trees" },
  { id: 1448, name: "Count Good Nodes in Binary Tree", difficulty: "Medium", category: "Trees" },
  { id: 98, name: "Validate Binary Search Tree", difficulty: "Medium", category: "Trees" },
  { id: 230, name: "Kth Smallest Element in a BST", difficulty: "Medium", category: "Trees" },
  { id: 105, name: "Construct Binary Tree from Preorder and Inorder", difficulty: "Medium", category: "Trees" },
  { id: 124, name: "Binary Tree Maximum Path Sum", difficulty: "Hard", category: "Trees" },
  { id: 297, name: "Serialize and Deserialize Binary Tree", difficulty: "Hard", category: "Trees" },
  
  // Tries
  { id: 208, name: "Implement Trie (Prefix Tree)", difficulty: "Medium", category: "Tries" },
  { id: 211, name: "Design Add and Search Words Data Structure", difficulty: "Medium", category: "Tries" },
  { id: 212, name: "Word Search II", difficulty: "Hard", category: "Tries" },
  
  // Heap / Priority Queue
  { id: 703, name: "Kth Largest Element in a Stream", difficulty: "Easy", category: "Heap" },
  { id: 1046, name: "Last Stone Weight", difficulty: "Easy", category: "Heap" },
  { id: 973, name: "K Closest Points to Origin", difficulty: "Medium", category: "Heap" },
  { id: 215, name: "Kth Largest Element in an Array", difficulty: "Medium", category: "Heap" },
  { id: 621, name: "Task Scheduler", difficulty: "Medium", category: "Heap" },
  { id: 355, name: "Design Twitter", difficulty: "Medium", category: "Heap" },
  { id: 295, name: "Find Median from Data Stream", difficulty: "Hard", category: "Heap" },
  
  // Backtracking
  { id: 78, name: "Subsets", difficulty: "Medium", category: "Backtracking" },
  { id: 39, name: "Combination Sum", difficulty: "Medium", category: "Backtracking" },
  { id: 46, name: "Permutations", difficulty: "Medium", category: "Backtracking" },
  { id: 90, name: "Subsets II", difficulty: "Medium", category: "Backtracking" },
  { id: 40, name: "Combination Sum II", difficulty: "Medium", category: "Backtracking" },
  { id: 79, name: "Word Search", difficulty: "Medium", category: "Backtracking" },
  { id: 131, name: "Palindrome Partitioning", difficulty: "Medium", category: "Backtracking" },
  { id: 17, name: "Letter Combinations of a Phone Number", difficulty: "Medium", category: "Backtracking" },
  { id: 51, name: "N-Queens", difficulty: "Hard", category: "Backtracking" },
  
  // Graphs
  { id: 200, name: "Number of Islands", difficulty: "Medium", category: "Graphs" },
  { id: 133, name: "Clone Graph", difficulty: "Medium", category: "Graphs" },
  { id: 695, name: "Max Area of Island", difficulty: "Medium", category: "Graphs" },
  { id: 417, name: "Pacific Atlantic Water Flow", difficulty: "Medium", category: "Graphs" },
  { id: 130, name: "Surrounded Regions", difficulty: "Medium", category: "Graphs" },
  { id: 994, name: "Rotting Oranges", difficulty: "Medium", category: "Graphs" },
  { id: 286, name: "Walls and Gates", difficulty: "Medium", category: "Graphs" },
  { id: 207, name: "Course Schedule", difficulty: "Medium", category: "Graphs" },
  { id: 210, name: "Course Schedule II", difficulty: "Medium", category: "Graphs" },
  { id: 684, name: "Redundant Connection", difficulty: "Medium", category: "Graphs" },
  { id: 323, name: "Number of Connected Components in Undirected Graph", difficulty: "Medium", category: "Graphs" },
  { id: 261, name: "Graph Valid Tree", difficulty: "Medium", category: "Graphs" },
  { id: 127, name: "Word Ladder", difficulty: "Hard", category: "Graphs" },
  
  // Advanced Graphs
  { id: 332, name: "Reconstruct Itinerary", difficulty: "Hard", category: "Advanced Graphs" },
  { id: 1584, name: "Min Cost to Connect All Points", difficulty: "Medium", category: "Advanced Graphs" },
  { id: 743, name: "Network Delay Time", difficulty: "Medium", category: "Advanced Graphs" },
  { id: 787, name: "Cheapest Flights Within K Stops", difficulty: "Medium", category: "Advanced Graphs" },
  { id: 269, name: "Alien Dictionary", difficulty: "Hard", category: "Advanced Graphs" },
  
  // 1-D Dynamic Programming
  { id: 70, name: "Climbing Stairs", difficulty: "Easy", category: "1-D DP" },
  { id: 746, name: "Min Cost Climbing Stairs", difficulty: "Easy", category: "1-D DP" },
  { id: 198, name: "House Robber", difficulty: "Medium", category: "1-D DP" },
  { id: 213, name: "House Robber II", difficulty: "Medium", category: "1-D DP" },
  { id: 5, name: "Longest Palindromic Substring", difficulty: "Medium", category: "1-D DP" },
  { id: 647, name: "Palindromic Substrings", difficulty: "Medium", category: "1-D DP" },
  { id: 91, name: "Decode Ways", difficulty: "Medium", category: "1-D DP" },
  { id: 322, name: "Coin Change", difficulty: "Medium", category: "1-D DP" },
  { id: 152, name: "Maximum Product Subarray", difficulty: "Medium", category: "1-D DP" },
  { id: 139, name: "Word Break", difficulty: "Medium", category: "1-D DP" },
  { id: 300, name: "Longest Increasing Subsequence", difficulty: "Medium", category: "1-D DP" },
  { id: 416, name: "Partition Equal Subset Sum", difficulty: "Medium", category: "1-D DP" },
  
  // 2-D Dynamic Programming
  { id: 62, name: "Unique Paths", difficulty: "Medium", category: "2-D DP" },
  { id: 1143, name: "Longest Common Subsequence", difficulty: "Medium", category: "2-D DP" },
  { id: 309, name: "Best Time to Buy and Sell Stock with Cooldown", difficulty: "Medium", category: "2-D DP" },
  { id: 518, name: "Coin Change II", difficulty: "Medium", category: "2-D DP" },
  { id: 494, name: "Target Sum", difficulty: "Medium", category: "2-D DP" },
  { id: 97, name: "Interleaving String", difficulty: "Medium", category: "2-D DP" },
  { id: 329, name: "Longest Increasing Path in a Matrix", difficulty: "Hard", category: "2-D DP" },
  { id: 115, name: "Distinct Subsequences", difficulty: "Hard", category: "2-D DP" },
  { id: 72, name: "Edit Distance", difficulty: "Medium", category: "2-D DP" },
  { id: 312, name: "Burst Balloons", difficulty: "Hard", category: "2-D DP" },
  { id: 10, name: "Regular Expression Matching", difficulty: "Hard", category: "2-D DP" },
  
  // Greedy
  { id: 53, name: "Maximum Subarray", difficulty: "Medium", category: "Greedy" },
  { id: 55, name: "Jump Game", difficulty: "Medium", category: "Greedy" },
  { id: 45, name: "Jump Game II", difficulty: "Medium", category: "Greedy" },
  { id: 134, name: "Gas Station", difficulty: "Medium", category: "Greedy" },
  { id: 846, name: "Hand of Straights", difficulty: "Medium", category: "Greedy" },
  { id: 1899, name: "Merge Triplets to Form Target Triplet", difficulty: "Medium", category: "Greedy" },
  { id: 763, name: "Partition Labels", difficulty: "Medium", category: "Greedy" },
  { id: 678, name: "Valid Parenthesis String", difficulty: "Medium", category: "Greedy" },
  
  // Intervals
  { id: 57, name: "Insert Interval", difficulty: "Medium", category: "Intervals" },
  { id: 56, name: "Merge Intervals", difficulty: "Medium", category: "Intervals" },
  { id: 435, name: "Non-overlapping Intervals", difficulty: "Medium", category: "Intervals" },
  { id: 252, name: "Meeting Rooms", difficulty: "Easy", category: "Intervals" },
  { id: 253, name: "Meeting Rooms II", difficulty: "Medium", category: "Intervals" },
  { id: 1851, name: "Minimum Interval to Include Each Query", difficulty: "Hard", category: "Intervals" },
  
  // Math & Geometry
  { id: 48, name: "Rotate Image", difficulty: "Medium", category: "Math & Geometry" },
  { id: 54, name: "Spiral Matrix", difficulty: "Medium", category: "Math & Geometry" },
  { id: 73, name: "Set Matrix Zeroes", difficulty: "Medium", category: "Math & Geometry" },
  { id: 202, name: "Happy Number", difficulty: "Easy", category: "Math & Geometry" },
  { id: 66, name: "Plus One", difficulty: "Easy", category: "Math & Geometry" },
  { id: 50, name: "Pow(x, n)", difficulty: "Medium", category: "Math & Geometry" },
  { id: 43, name: "Multiply Strings", difficulty: "Medium", category: "Math & Geometry" },
  { id: 2013, name: "Detect Squares", difficulty: "Medium", category: "Math & Geometry" },
  
  // Bit Manipulation
  { id: 136, name: "Single Number", difficulty: "Easy", category: "Bit Manipulation" },
  { id: 191, name: "Number of 1 Bits", difficulty: "Easy", category: "Bit Manipulation" },
  { id: 338, name: "Counting Bits", difficulty: "Easy", category: "Bit Manipulation" },
  { id: 190, name: "Reverse Bits", difficulty: "Easy", category: "Bit Manipulation" },
  { id: 268, name: "Missing Number", difficulty: "Easy", category: "Bit Manipulation" },
  { id: 371, name: "Sum of Two Integers", difficulty: "Medium", category: "Bit Manipulation" },
  { id: 7, name: "Reverse Integer", difficulty: "Medium", category: "Bit Manipulation" },
];

// Helper to get a random problem
export const getRandomProblem = (difficulty?: 'Easy' | 'Medium' | 'Hard'): LeetCodeProblem => {
  const filtered = difficulty 
    ? NEETCODE_150.filter(p => p.difficulty === difficulty)
    : NEETCODE_150;
  return filtered[Math.floor(Math.random() * filtered.length)];
};

export const SYSTEM_PROMPTS: Record<InterviewType, InterviewConfig> = {
  TECHNICAL: {
    title: "Technical Interview",
    description: "NeetCode 150 problems using the UMPIRE strategy.",
    icon: "Code",
    systemInstruction: `You are a strict but fair Senior Software Engineer at a top tech company conducting a technical interview for a New Grad position.
    
    Follow the **UMPIRE** method framework to guide the interview:
    1. **Understand**: Start by presenting a RANDOM coding problem from 'NeetCode 150'. Wait for the candidate to ask clarifying questions (constraints, inputs, outputs). If they don't, prompt them to think about edge cases.
    2. **Match & Plan**: Before they write code, ask for their approach. Encourage them to explain their logic or pseudocode first. Identifying the correct pattern/data structure is key.
    3. **Implement**: Allow them to write the solution. The preferred language is **Python**. If the candidate asks about language, tell them to use Python.
    4. **Review**: Ask them to walk through a test case or dry run their code.
    5. **Evaluate**: Finally, ask for Time and Space complexity (Big O).
    
    General Rules:
    - Do NOT solve the problem for the candidate.
    - If they are stuck, offer small, progressive hints.
    - Evaluate their code for correctness, edge cases, and style (Pythonic code).
    - Keep your responses concise and conversational.`,
    initialMessage: "Hello! I'm your interviewer today. I've pulled a question from our question bank (NeetCode 150). We will follow the UMPIRE method (Understand, Match, Plan, Implement, Review, Evaluate). Please use Python for your solution. Are you ready to begin?"
  },
  BEHAVIORAL: {
    title: "Behavioral Interview",
    description: "STAR method practice for culture fit.",
    icon: "Users",
    systemInstruction: `You are a Hiring Manager at a tech company. 
    1. Conduct a behavioral interview using the STAR method (Situation, Task, Action, Result).
    2. Start by asking: "Tell me about yourself."
    3. Follow up with questions like "Tell me about a time you failed" or "Describe a conflict with a coworker."
    4. Dig deep. If a user is vague, ask clarifying questions.
    5. Be professional and empathetic.`,
    initialMessage: "Hi there. Thanks for joining me today. To start off, could you briefly tell me about yourself and why you're interested in this role?"
  },
  SYSTEM_DESIGN: {
    title: "System Design",
    description: "Design scalable systems (e.g., URL Shortener).",
    icon: "Layout",
    systemInstruction: `You are a Principal Architect. 
    1. Ask the candidate to design a system suitable for a new grad / junior level (e.g., Design a URL Shortener, Design Instagram Feed, Design a Chat App).
    2. Focus on high-level components: Client, API Gateway, Load Balancer, Web Servers, Database (SQL vs NoSQL), Caching.
    3. Do not expect deep distributed systems knowledge, but check for basic understanding of scalability and trade-offs.
    4. Guide them through the process: Requirements gathering -> High Level Design -> Deep Dive.`,
    initialMessage: "Welcome. For this session, we'll do a system design exercise. I'd like you to design a URL Shortener like bit.ly. What are the functional requirements you'd consider?"
  }
};