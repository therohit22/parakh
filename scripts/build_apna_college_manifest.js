// scripts/build_apna_college_manifest.js
// Builds the Apna College DSA import manifest for Parakh
// Discovered from Apna College DSA sheet, independently verified against LeetCode

/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require('fs');

// All questions discovered from Apna College DSA sheet, with verified LeetCode mappings.
// Each has: title, slug, leetcodeUrl, difficulty, topics, companies (Parakh slugs only).
// Deduplication notes: Questions already in Parakh DB will be MERGED (add new company refs).

const questions = [
  // ═══ ARRAYS ═══
  {
    title: "Two Sum",
    slug: "two-sum",
    description: "Find two numbers in an array that add up to a given target and return their indices.",
    difficulty: "Easy",
    topics: ["Array", "Hash Table"],
    companies: ["amazon", "google", "microsoft", "flipkart"],
    leetcodeUrl: "https://leetcode.com/problems/two-sum/",
    status: "MERGE_WITH_EXISTING"
  },
  {
    title: "Best Time to Buy and Sell Stock",
    slug: "best-time-to-buy-and-sell-stock",
    description: "Find the maximum profit from a single buy and sell transaction on stock prices.",
    difficulty: "Easy",
    topics: ["Array", "Dynamic Programming"],
    companies: ["amazon", "microsoft", "flipkart"],
    leetcodeUrl: "https://leetcode.com/problems/best-time-to-buy-and-sell-stock/",
    status: "IMPORT"
  },
  {
    title: "Contains Duplicate",
    slug: "contains-duplicate",
    description: "Determine if any value appears at least twice in an integer array.",
    difficulty: "Easy",
    topics: ["Array", "Hash Table", "Sorting"],
    companies: ["amazon", "google"],
    leetcodeUrl: "https://leetcode.com/problems/contains-duplicate/",
    status: "IMPORT"
  },
  {
    title: "Maximum Subarray",
    slug: "maximum-subarray",
    description: "Find the contiguous subarray with the largest sum using Kadane's algorithm.",
    difficulty: "Medium",
    topics: ["Array", "Dynamic Programming", "Divide and Conquer"],
    companies: ["microsoft", "amazon"],
    leetcodeUrl: "https://leetcode.com/problems/maximum-subarray/",
    status: "IMPORT"
  },
  {
    title: "Product of Array Except Self",
    slug: "product-of-array-except-self",
    description: "Compute an output array where each element is the product of all other elements without division.",
    difficulty: "Medium",
    topics: ["Array", "Prefix Sum"],
    companies: ["amazon", "microsoft"],
    leetcodeUrl: "https://leetcode.com/problems/product-of-array-except-self/",
    status: "MERGE_WITH_EXISTING"
  },
  {
    title: "3Sum",
    slug: "3sum",
    description: "Find all unique triplets in the array that sum to zero.",
    difficulty: "Medium",
    topics: ["Array", "Two Pointers", "Sorting"],
    companies: ["amazon", "microsoft", "google"],
    leetcodeUrl: "https://leetcode.com/problems/3sum/",
    status: "MERGE_WITH_EXISTING"
  },
  {
    title: "Search in Rotated Sorted Array",
    slug: "search-in-rotated-sorted-array",
    description: "Search for a target value in a rotated sorted array with O(log n) time.",
    difficulty: "Medium",
    topics: ["Array", "Binary Search"],
    companies: ["google", "microsoft", "amazon", "flipkart"],
    leetcodeUrl: "https://leetcode.com/problems/search-in-rotated-sorted-array/",
    status: "IMPORT"
  },
  {
    title: "Next Permutation",
    slug: "next-permutation",
    description: "Rearrange numbers into the lexicographically next greater permutation in-place.",
    difficulty: "Medium",
    topics: ["Array", "Two Pointers"],
    companies: ["google", "amazon"],
    leetcodeUrl: "https://leetcode.com/problems/next-permutation/",
    status: "MERGE_WITH_EXISTING"
  },
  {
    title: "Spiral Matrix",
    slug: "spiral-matrix",
    description: "Return all elements of a matrix in spiral order traversal.",
    difficulty: "Medium",
    topics: ["Array", "Matrix", "Simulation"],
    companies: ["microsoft", "amazon", "google"],
    leetcodeUrl: "https://leetcode.com/problems/spiral-matrix/",
    status: "MERGE_WITH_EXISTING"
  },
  {
    title: "Rotate Image",
    slug: "rotate-image",
    description: "Rotate a 2D matrix 90 degrees clockwise in-place.",
    difficulty: "Medium",
    topics: ["Array", "Matrix", "Math"],
    companies: ["microsoft", "amazon"],
    leetcodeUrl: "https://leetcode.com/problems/rotate-image/",
    status: "MERGE_WITH_EXISTING"
  },
  {
    title: "Trapping Rain Water",
    slug: "trapping-rain-water",
    description: "Compute how much water can be trapped between bars after raining.",
    difficulty: "Hard",
    topics: ["Array", "Two Pointers", "Stack", "Dynamic Programming"],
    companies: ["amazon", "microsoft", "google"],
    leetcodeUrl: "https://leetcode.com/problems/trapping-rain-water/",
    status: "IMPORT"
  },
  {
    title: "Set Matrix Zeroes",
    slug: "set-matrix-zeroes",
    description: "If an element is zero, set its entire row and column to zero in-place.",
    difficulty: "Medium",
    topics: ["Array", "Matrix", "Hash Table"],
    companies: ["microsoft", "amazon"],
    leetcodeUrl: "https://leetcode.com/problems/set-matrix-zeroes/",
    status: "IMPORT"
  },
  {
    title: "Find Minimum in Rotated Sorted Array",
    slug: "find-minimum-in-rotated-sorted-array",
    description: "Find the minimum element in a rotated sorted array in O(log n).",
    difficulty: "Medium",
    topics: ["Array", "Binary Search"],
    companies: ["amazon", "microsoft"],
    leetcodeUrl: "https://leetcode.com/problems/find-minimum-in-rotated-sorted-array/",
    status: "IMPORT"
  },
  {
    title: "Median of Two Sorted Arrays",
    slug: "median-of-two-sorted-arrays",
    description: "Find the median of two sorted arrays with O(log(m+n)) complexity.",
    difficulty: "Hard",
    topics: ["Array", "Binary Search", "Divide and Conquer"],
    companies: ["google", "microsoft", "amazon"],
    leetcodeUrl: "https://leetcode.com/problems/median-of-two-sorted-arrays/",
    status: "MERGE_WITH_EXISTING"
  },

  // ═══ STRINGS ═══
  {
    title: "Valid Anagram",
    slug: "valid-anagram",
    description: "Determine if two strings are anagrams of each other.",
    difficulty: "Easy",
    topics: ["String", "Hash Table", "Sorting"],
    companies: ["amazon"],
    leetcodeUrl: "https://leetcode.com/problems/valid-anagram/",
    status: "IMPORT"
  },
  {
    title: "Valid Palindrome",
    slug: "valid-palindrome",
    description: "Check whether a string is a palindrome considering only alphanumeric characters.",
    difficulty: "Easy",
    topics: ["String", "Two Pointers"],
    companies: ["microsoft", "amazon"],
    leetcodeUrl: "https://leetcode.com/problems/valid-palindrome/",
    status: "MERGE_WITH_EXISTING"
  },
  {
    title: "Longest Common Prefix",
    slug: "longest-common-prefix",
    description: "Find the longest common prefix string amongst an array of strings.",
    difficulty: "Easy",
    topics: ["String", "Trie"],
    companies: ["amazon", "microsoft", "google"],
    leetcodeUrl: "https://leetcode.com/problems/longest-common-prefix/",
    status: "IMPORT"
  },
  {
    title: "Longest Substring Without Repeating Characters",
    slug: "longest-substring-without-repeating-characters",
    description: "Find the length of the longest substring without repeating characters.",
    difficulty: "Medium",
    topics: ["String", "Hash Table", "Sliding Window"],
    companies: ["amazon", "microsoft", "google", "netflix"],
    leetcodeUrl: "https://leetcode.com/problems/longest-substring-without-repeating-characters/",
    status: "IMPORT"
  },
  {
    title: "Longest Palindromic Substring",
    slug: "longest-palindromic-substring",
    description: "Return the longest palindromic substring in a given string.",
    difficulty: "Medium",
    topics: ["String", "Dynamic Programming"],
    companies: ["amazon", "microsoft"],
    leetcodeUrl: "https://leetcode.com/problems/longest-palindromic-substring/",
    status: "IMPORT"
  },
  {
    title: "Longest Repeating Character Replacement",
    slug: "longest-repeating-character-replacement",
    description: "Find the length of the longest substring after replacing at most k characters.",
    difficulty: "Medium",
    topics: ["String", "Sliding Window", "Hash Table"],
    companies: ["google", "amazon"],
    leetcodeUrl: "https://leetcode.com/problems/longest-repeating-character-replacement/",
    status: "IMPORT"
  },
  {
    title: "Reverse Words in a String",
    slug: "reverse-words-in-a-string",
    description: "Reverse the order of words in a string.",
    difficulty: "Medium",
    topics: ["String", "Two Pointers"],
    companies: ["microsoft", "amazon"],
    leetcodeUrl: "https://leetcode.com/problems/reverse-words-in-a-string/",
    status: "IMPORT"
  },

  // ═══ LINKED LISTS ═══
  {
    title: "Reverse Linked List",
    slug: "reverse-linked-list",
    description: "Reverse a singly linked list iteratively or recursively.",
    difficulty: "Easy",
    topics: ["Linked List", "Recursion"],
    companies: ["amazon", "microsoft", "flipkart"],
    leetcodeUrl: "https://leetcode.com/problems/reverse-linked-list/",
    status: "MERGE_WITH_EXISTING"
  },
  {
    title: "Merge Two Sorted Lists",
    slug: "merge-two-sorted-lists",
    description: "Merge two sorted linked lists into one sorted linked list.",
    difficulty: "Easy",
    topics: ["Linked List", "Recursion"],
    companies: ["amazon", "microsoft", "flipkart"],
    leetcodeUrl: "https://leetcode.com/problems/merge-two-sorted-lists/",
    status: "IMPORT"
  },
  {
    title: "Linked List Cycle",
    slug: "linked-list-cycle",
    description: "Determine if a linked list has a cycle using Floyd's detection algorithm.",
    difficulty: "Easy",
    topics: ["Linked List", "Two Pointers"],
    companies: ["amazon", "microsoft"],
    leetcodeUrl: "https://leetcode.com/problems/linked-list-cycle/",
    status: "IMPORT"
  },
  {
    title: "Remove Nth Node From End of List",
    slug: "remove-nth-node-from-end-of-list",
    description: "Remove the nth node from the end of the list in one pass.",
    difficulty: "Medium",
    topics: ["Linked List", "Two Pointers"],
    companies: ["amazon", "microsoft"],
    leetcodeUrl: "https://leetcode.com/problems/remove-nth-node-from-end-of-list/",
    status: "IMPORT"
  },
  {
    title: "Linked List Cycle II",
    slug: "linked-list-cycle-ii",
    description: "Find the node where the cycle begins in a linked list.",
    difficulty: "Medium",
    topics: ["Linked List", "Two Pointers"],
    companies: ["amazon", "microsoft"],
    leetcodeUrl: "https://leetcode.com/problems/linked-list-cycle-ii/",
    status: "IMPORT"
  },
  {
    title: "Palindrome Linked List",
    slug: "palindrome-linked-list",
    description: "Check whether a singly linked list is a palindrome in O(n) time and O(1) space.",
    difficulty: "Easy",
    topics: ["Linked List", "Two Pointers", "Stack", "Recursion"],
    companies: ["amazon"],
    leetcodeUrl: "https://leetcode.com/problems/palindrome-linked-list/",
    status: "IMPORT"
  },
  {
    title: "Sort List",
    slug: "sort-list",
    description: "Sort a linked list in O(n log n) time using merge sort.",
    difficulty: "Medium",
    topics: ["Linked List", "Sorting", "Divide and Conquer", "Merge Sort"],
    companies: ["amazon", "microsoft"],
    leetcodeUrl: "https://leetcode.com/problems/sort-list/",
    status: "IMPORT"
  },
  {
    title: "Copy List with Random Pointer",
    slug: "copy-list-with-random-pointer",
    description: "Deep copy a linked list where each node has a random pointer.",
    difficulty: "Medium",
    topics: ["Linked List", "Hash Table"],
    companies: ["amazon", "microsoft", "flipkart"],
    leetcodeUrl: "https://leetcode.com/problems/copy-list-with-random-pointer/",
    status: "IMPORT"
  },
  {
    title: "Reverse Nodes in k-Group",
    slug: "reverse-nodes-in-k-group",
    description: "Reverse nodes of a linked list k at a time.",
    difficulty: "Hard",
    topics: ["Linked List", "Recursion"],
    companies: ["microsoft", "amazon"],
    leetcodeUrl: "https://leetcode.com/problems/reverse-nodes-in-k-group/",
    status: "IMPORT"
  },
  {
    title: "Merge k Sorted Lists",
    slug: "merge-k-sorted-lists",
    description: "Merge k sorted linked lists into one sorted linked list.",
    difficulty: "Hard",
    topics: ["Linked List", "Divide and Conquer", "Heap"],
    companies: ["google", "amazon", "microsoft", "flipkart"],
    leetcodeUrl: "https://leetcode.com/problems/merge-k-sorted-lists/",
    status: "MERGE_WITH_EXISTING"
  },

  // ═══ STACKS & QUEUES ═══
  {
    title: "Valid Parentheses",
    slug: "valid-parentheses",
    description: "Determine if the input string has valid matching brackets.",
    difficulty: "Easy",
    topics: ["Stack", "String"],
    companies: ["amazon", "microsoft", "google"],
    leetcodeUrl: "https://leetcode.com/problems/valid-parentheses/",
    status: "IMPORT"
  },
  {
    title: "Min Stack",
    slug: "min-stack",
    description: "Design a stack that supports push, pop, top, and retrieving the minimum element in constant time.",
    difficulty: "Medium",
    topics: ["Stack", "Design"],
    companies: ["amazon", "microsoft"],
    leetcodeUrl: "https://leetcode.com/problems/min-stack/",
    status: "IMPORT"
  },
  {
    title: "Daily Temperatures",
    slug: "daily-temperatures",
    description: "Find how many days until a warmer temperature for each day using a stack.",
    difficulty: "Medium",
    topics: ["Stack", "Array", "Monotonic Stack"],
    companies: ["amazon", "google"],
    leetcodeUrl: "https://leetcode.com/problems/daily-temperatures/",
    status: "MERGE_WITH_EXISTING"
  },
  {
    title: "Largest Rectangle in Histogram",
    slug: "largest-rectangle-in-histogram",
    description: "Find the largest rectangular area possible in a histogram.",
    difficulty: "Hard",
    topics: ["Stack", "Array", "Monotonic Stack"],
    companies: ["amazon", "microsoft", "google", "flipkart"],
    leetcodeUrl: "https://leetcode.com/problems/largest-rectangle-in-histogram/",
    status: "IMPORT"
  },
  {
    title: "Sliding Window Maximum",
    slug: "sliding-window-maximum",
    description: "Find the maximum element in each sliding window of size k.",
    difficulty: "Hard",
    topics: ["Array", "Queue", "Sliding Window", "Monotonic Queue", "Heap"],
    companies: ["amazon", "google", "flipkart"],
    leetcodeUrl: "https://leetcode.com/problems/sliding-window-maximum/",
    status: "MERGE_WITH_EXISTING"
  },

  // ═══ TREES & BST ═══
  {
    title: "Maximum Depth of Binary Tree",
    slug: "maximum-depth-of-binary-tree",
    description: "Find the maximum depth (height) of a binary tree.",
    difficulty: "Easy",
    topics: ["Tree", "DFS", "BFS", "Binary Tree"],
    companies: ["amazon"],
    leetcodeUrl: "https://leetcode.com/problems/maximum-depth-of-binary-tree/",
    status: "MERGE_WITH_EXISTING"
  },
  {
    title: "Invert Binary Tree",
    slug: "invert-binary-tree",
    description: "Invert a binary tree by swapping left and right children at every node.",
    difficulty: "Easy",
    topics: ["Tree", "DFS", "BFS", "Binary Tree"],
    companies: ["google", "amazon"],
    leetcodeUrl: "https://leetcode.com/problems/invert-binary-tree/",
    status: "MERGE_WITH_EXISTING"
  },
  {
    title: "Symmetric Tree",
    slug: "symmetric-tree",
    description: "Check whether a binary tree is a mirror of itself.",
    difficulty: "Easy",
    topics: ["Tree", "DFS", "BFS", "Binary Tree"],
    companies: ["microsoft", "amazon"],
    leetcodeUrl: "https://leetcode.com/problems/symmetric-tree/",
    status: "IMPORT"
  },
  {
    title: "Subtree of Another Tree",
    slug: "subtree-of-another-tree",
    description: "Check whether one binary tree is a subtree of another.",
    difficulty: "Easy",
    topics: ["Tree", "DFS", "Binary Tree"],
    companies: ["amazon", "microsoft"],
    leetcodeUrl: "https://leetcode.com/problems/subtree-of-another-tree/",
    status: "IMPORT"
  },
  {
    title: "Diameter of Binary Tree",
    slug: "diameter-of-binary-tree",
    description: "Find the length of the longest path between any two nodes in a binary tree.",
    difficulty: "Easy",
    topics: ["Tree", "DFS", "Binary Tree"],
    companies: ["amazon", "google"],
    leetcodeUrl: "https://leetcode.com/problems/diameter-of-binary-tree/",
    status: "MERGE_WITH_EXISTING"
  },
  {
    title: "Binary Tree Level Order Traversal",
    slug: "binary-tree-level-order-traversal",
    description: "Return the level-order (BFS) traversal of a binary tree's node values.",
    difficulty: "Medium",
    topics: ["Tree", "BFS", "Binary Tree"],
    companies: ["amazon", "microsoft", "flipkart"],
    leetcodeUrl: "https://leetcode.com/problems/binary-tree-level-order-traversal/",
    status: "IMPORT"
  },
  {
    title: "Lowest Common Ancestor of a Binary Tree",
    slug: "lowest-common-ancestor-of-a-binary-tree",
    description: "Find the lowest common ancestor of two given nodes in a binary tree.",
    difficulty: "Medium",
    topics: ["Tree", "DFS", "Binary Tree"],
    companies: ["amazon", "microsoft", "flipkart", "google"],
    leetcodeUrl: "https://leetcode.com/problems/lowest-common-ancestor-of-a-binary-tree/",
    status: "MERGE_WITH_EXISTING"
  },
  {
    title: "Validate Binary Search Tree",
    slug: "validate-binary-search-tree",
    description: "Determine if a binary tree is a valid binary search tree.",
    difficulty: "Medium",
    topics: ["Tree", "DFS", "BST", "Binary Tree"],
    companies: ["amazon", "microsoft"],
    leetcodeUrl: "https://leetcode.com/problems/validate-binary-search-tree/",
    status: "MERGE_WITH_EXISTING"
  },
  {
    title: "Kth Smallest Element in a BST",
    slug: "kth-smallest-element-in-a-bst",
    description: "Find the kth smallest element in a binary search tree.",
    difficulty: "Medium",
    topics: ["Tree", "DFS", "BST", "Binary Tree"],
    companies: ["amazon", "google"],
    leetcodeUrl: "https://leetcode.com/problems/kth-smallest-element-in-a-bst/",
    status: "IMPORT"
  },
  {
    title: "Construct Binary Tree from Preorder and Inorder Traversal",
    slug: "construct-binary-tree-from-preorder-and-inorder-traversal",
    description: "Build a binary tree from its preorder and inorder traversal arrays.",
    difficulty: "Medium",
    topics: ["Tree", "Array", "Divide and Conquer", "Binary Tree"],
    companies: ["amazon", "microsoft"],
    leetcodeUrl: "https://leetcode.com/problems/construct-binary-tree-from-preorder-and-inorder-traversal/",
    status: "IMPORT"
  },
  {
    title: "Lowest Common Ancestor of a Binary Search Tree",
    slug: "lowest-common-ancestor-of-a-binary-search-tree",
    description: "Find the lowest common ancestor of two nodes in a BST using BST properties.",
    difficulty: "Medium",
    topics: ["Tree", "DFS", "BST", "Binary Tree"],
    companies: ["amazon", "microsoft"],
    leetcodeUrl: "https://leetcode.com/problems/lowest-common-ancestor-of-a-binary-search-tree/",
    status: "IMPORT"
  },
  {
    title: "Binary Tree Maximum Path Sum",
    slug: "binary-tree-maximum-path-sum",
    description: "Find the maximum path sum in a binary tree where the path may start and end at any node.",
    difficulty: "Hard",
    topics: ["Tree", "DFS", "Dynamic Programming", "Binary Tree"],
    companies: ["amazon", "microsoft", "google"],
    leetcodeUrl: "https://leetcode.com/problems/binary-tree-maximum-path-sum/",
    status: "IMPORT"
  },
  {
    title: "Serialize and Deserialize Binary Tree",
    slug: "serialize-and-deserialize-binary-tree",
    description: "Design an algorithm to serialize and deserialize a binary tree.",
    difficulty: "Hard",
    topics: ["Tree", "String", "DFS", "BFS", "Design", "Binary Tree"],
    companies: ["amazon", "microsoft", "google"],
    leetcodeUrl: "https://leetcode.com/problems/serialize-and-deserialize-binary-tree/",
    status: "MERGE_WITH_EXISTING"
  },

  // ═══ HEAPS / PRIORITY QUEUES ═══
  {
    title: "Kth Largest Element in an Array",
    slug: "kth-largest-element-in-an-array",
    description: "Find the kth largest element in an unsorted array.",
    difficulty: "Medium",
    topics: ["Array", "Divide and Conquer", "Sorting", "Heap", "Quickselect"],
    companies: ["amazon", "microsoft", "google"],
    leetcodeUrl: "https://leetcode.com/problems/kth-largest-element-in-an-array/",
    status: "IMPORT"
  },
  {
    title: "Top K Frequent Elements",
    slug: "top-k-frequent-elements",
    description: "Return the k most frequent elements from an integer array.",
    difficulty: "Medium",
    topics: ["Array", "Hash Table", "Divide and Conquer", "Sorting", "Heap", "Bucket Sort"],
    companies: ["amazon", "google", "flipkart"],
    leetcodeUrl: "https://leetcode.com/problems/top-k-frequent-elements/",
    status: "MERGE_WITH_EXISTING"
  },
  {
    title: "Find Median from Data Stream",
    slug: "find-median-from-data-stream",
    description: "Design a data structure that supports adding numbers and finding the median efficiently.",
    difficulty: "Hard",
    topics: ["Two Pointers", "Design", "Sorting", "Heap", "Data Stream"],
    companies: ["amazon", "google", "microsoft", "flipkart"],
    leetcodeUrl: "https://leetcode.com/problems/find-median-from-data-stream/",
    status: "MERGE_WITH_EXISTING"
  },

  // ═══ TRIES ═══
  {
    title: "Implement Trie (Prefix Tree)",
    slug: "implement-trie-prefix-tree",
    description: "Design a trie with insert, search, and startsWith operations.",
    difficulty: "Medium",
    topics: ["Hash Table", "String", "Design", "Trie"],
    companies: ["google", "amazon", "microsoft"],
    leetcodeUrl: "https://leetcode.com/problems/implement-trie-prefix-tree/",
    status: "IMPORT"
  },
  {
    title: "Word Search II",
    slug: "word-search-ii",
    description: "Find all words from a dictionary that can be formed in a 2D board of characters.",
    difficulty: "Hard",
    topics: ["Array", "String", "Backtracking", "Trie", "Matrix"],
    companies: ["amazon", "microsoft", "google"],
    leetcodeUrl: "https://leetcode.com/problems/word-search-ii/",
    status: "IMPORT"
  },

  // ═══ GREEDY ═══
  {
    title: "Jump Game",
    slug: "jump-game",
    description: "Determine if you can reach the last index of the array.",
    difficulty: "Medium",
    topics: ["Array", "Dynamic Programming", "Greedy"],
    companies: ["amazon", "microsoft"],
    leetcodeUrl: "https://leetcode.com/problems/jump-game/",
    status: "MERGE_WITH_EXISTING"
  },
  {
    title: "Jump Game II",
    slug: "jump-game-ii",
    description: "Find the minimum number of jumps to reach the last index.",
    difficulty: "Medium",
    topics: ["Array", "Dynamic Programming", "Greedy"],
    companies: ["amazon"],
    leetcodeUrl: "https://leetcode.com/problems/jump-game-ii/",
    status: "IMPORT"
  },
  {
    title: "Gas Station",
    slug: "gas-station",
    description: "Find the starting gas station index to complete a circular tour.",
    difficulty: "Medium",
    topics: ["Array", "Greedy"],
    companies: ["amazon", "google", "microsoft"],
    leetcodeUrl: "https://leetcode.com/problems/gas-station/",
    status: "MERGE_WITH_EXISTING"
  },
  {
    title: "Merge Intervals",
    slug: "merge-intervals",
    description: "Merge all overlapping intervals and return the result.",
    difficulty: "Medium",
    topics: ["Array", "Sorting"],
    companies: ["amazon", "google", "microsoft"],
    leetcodeUrl: "https://leetcode.com/problems/merge-intervals/",
    status: "MERGE_WITH_EXISTING"
  },

  // ═══ DYNAMIC PROGRAMMING ═══
  {
    title: "Climbing Stairs",
    slug: "climbing-stairs",
    description: "Count distinct ways to climb n stairs taking 1 or 2 steps at a time.",
    difficulty: "Easy",
    topics: ["Math", "Dynamic Programming", "Memoization"],
    companies: ["amazon", "google"],
    leetcodeUrl: "https://leetcode.com/problems/climbing-stairs/",
    status: "IMPORT"
  },
  {
    title: "Min Cost Climbing Stairs",
    slug: "min-cost-climbing-stairs",
    description: "Find the minimum cost to reach the top of the staircase.",
    difficulty: "Easy",
    topics: ["Array", "Dynamic Programming"],
    companies: ["google", "microsoft"],
    leetcodeUrl: "https://leetcode.com/problems/min-cost-climbing-stairs/",
    status: "MERGE_WITH_EXISTING"
  },
  {
    title: "House Robber",
    slug: "house-robber",
    description: "Find the maximum amount that can be robbed from non-adjacent houses.",
    difficulty: "Medium",
    topics: ["Array", "Dynamic Programming"],
    companies: ["microsoft", "amazon"],
    leetcodeUrl: "https://leetcode.com/problems/house-robber/",
    status: "IMPORT"
  },
  {
    title: "House Robber II",
    slug: "house-robber-ii",
    description: "Rob houses arranged in a circle maximizing value without adjacent houses.",
    difficulty: "Medium",
    topics: ["Array", "Dynamic Programming"],
    companies: ["microsoft", "amazon"],
    leetcodeUrl: "https://leetcode.com/problems/house-robber-ii/",
    status: "IMPORT"
  },
  {
    title: "Coin Change",
    slug: "coin-change",
    description: "Find the fewest number of coins that make up a given amount.",
    difficulty: "Medium",
    topics: ["Array", "Dynamic Programming", "BFS"],
    companies: ["amazon", "microsoft"],
    leetcodeUrl: "https://leetcode.com/problems/coin-change/",
    status: "MERGE_WITH_EXISTING"
  },
  {
    title: "Longest Increasing Subsequence",
    slug: "longest-increasing-subsequence",
    description: "Find the length of the longest strictly increasing subsequence.",
    difficulty: "Medium",
    topics: ["Array", "Binary Search", "Dynamic Programming"],
    companies: ["microsoft", "google", "amazon"],
    leetcodeUrl: "https://leetcode.com/problems/longest-increasing-subsequence/",
    status: "MERGE_WITH_EXISTING"
  },
  {
    title: "Longest Common Subsequence",
    slug: "longest-common-subsequence",
    description: "Find the length of the longest subsequence common to two strings.",
    difficulty: "Medium",
    topics: ["String", "Dynamic Programming"],
    companies: ["amazon", "google", "microsoft"],
    leetcodeUrl: "https://leetcode.com/problems/longest-common-subsequence/",
    status: "IMPORT"
  },
  {
    title: "Edit Distance",
    slug: "edit-distance",
    description: "Find the minimum number of operations to convert one string into another.",
    difficulty: "Medium",
    topics: ["String", "Dynamic Programming"],
    companies: ["google", "amazon", "microsoft"],
    leetcodeUrl: "https://leetcode.com/problems/edit-distance/",
    status: "MERGE_WITH_EXISTING"
  },
  {
    title: "Partition Equal Subset Sum",
    slug: "partition-equal-subset-sum",
    description: "Determine if an array can be partitioned into two subsets with equal sum.",
    difficulty: "Medium",
    topics: ["Array", "Dynamic Programming"],
    companies: ["amazon", "google"],
    leetcodeUrl: "https://leetcode.com/problems/partition-equal-subset-sum/",
    status: "MERGE_WITH_EXISTING"
  },
  {
    title: "Combination Sum IV",
    slug: "combination-sum-iv",
    description: "Find the number of possible combinations that add up to a target.",
    difficulty: "Medium",
    topics: ["Array", "Dynamic Programming"],
    companies: ["google", "amazon"],
    leetcodeUrl: "https://leetcode.com/problems/combination-sum-iv/",
    status: "IMPORT"
  },
  {
    title: "Decode Ways",
    slug: "decode-ways",
    description: "Count the number of ways to decode a numeric string into letters.",
    difficulty: "Medium",
    topics: ["String", "Dynamic Programming"],
    companies: ["amazon", "microsoft", "google"],
    leetcodeUrl: "https://leetcode.com/problems/decode-ways/",
    status: "MERGE_WITH_EXISTING"
  },

  // ═══ GRAPHS ═══
  {
    title: "Number of Islands",
    slug: "number-of-islands",
    description: "Count the number of islands in a 2D binary grid.",
    difficulty: "Medium",
    topics: ["Array", "DFS", "BFS", "Matrix", "Union Find"],
    companies: ["amazon", "google", "microsoft"],
    leetcodeUrl: "https://leetcode.com/problems/number-of-islands/",
    status: "MERGE_WITH_EXISTING"
  },
  {
    title: "Clone Graph",
    slug: "clone-graph",
    description: "Return a deep clone of a connected undirected graph.",
    difficulty: "Medium",
    topics: ["Hash Table", "DFS", "BFS", "Graph"],
    companies: ["amazon", "google", "microsoft"],
    leetcodeUrl: "https://leetcode.com/problems/clone-graph/",
    status: "MERGE_WITH_EXISTING"
  },
  {
    title: "Course Schedule",
    slug: "course-schedule",
    description: "Determine if all courses can be finished given prerequisites (cycle detection).",
    difficulty: "Medium",
    topics: ["DFS", "BFS", "Graph", "Topological Sort"],
    companies: ["google", "amazon"],
    leetcodeUrl: "https://leetcode.com/problems/course-schedule/",
    status: "MERGE_WITH_EXISTING"
  },
  {
    title: "Course Schedule II",
    slug: "course-schedule-ii",
    description: "Return the ordering of courses to finish all given prerequisites.",
    difficulty: "Medium",
    topics: ["DFS", "BFS", "Graph", "Topological Sort"],
    companies: ["google", "amazon"],
    leetcodeUrl: "https://leetcode.com/problems/course-schedule-ii/",
    status: "MERGE_WITH_EXISTING"
  },
  {
    title: "Pacific Atlantic Water Flow",
    slug: "pacific-atlantic-water-flow",
    description: "Find cells where water can flow to both Pacific and Atlantic oceans.",
    difficulty: "Medium",
    topics: ["Array", "DFS", "BFS", "Matrix"],
    companies: ["google", "amazon"],
    leetcodeUrl: "https://leetcode.com/problems/pacific-atlantic-water-flow/",
    status: "MERGE_WITH_EXISTING"
  },
  {
    title: "Rotting Oranges",
    slug: "rotting-oranges",
    description: "Find the minimum time for all oranges to rot using BFS.",
    difficulty: "Medium",
    topics: ["Array", "BFS", "Matrix"],
    companies: ["amazon", "microsoft"],
    leetcodeUrl: "https://leetcode.com/problems/rotting-oranges/",
    status: "MERGE_WITH_EXISTING"
  },

  // ═══ BACKTRACKING ═══
  {
    title: "Word Search",
    slug: "word-search",
    description: "Search for a word in a 2D board of characters by moving adjacently.",
    difficulty: "Medium",
    topics: ["Array", "String", "Backtracking", "Matrix"],
    companies: ["google", "amazon", "microsoft"],
    leetcodeUrl: "https://leetcode.com/problems/word-search/",
    status: "MERGE_WITH_EXISTING"
  },
  {
    title: "Combination Sum",
    slug: "combination-sum",
    description: "Find all unique combinations of candidates that sum to target.",
    difficulty: "Medium",
    topics: ["Array", "Backtracking"],
    companies: ["amazon"],
    leetcodeUrl: "https://leetcode.com/problems/combination-sum/",
    status: "MERGE_WITH_EXISTING"
  },
  {
    title: "Subsets",
    slug: "subsets",
    description: "Return all possible subsets (the power set) of a set of distinct integers.",
    difficulty: "Medium",
    topics: ["Array", "Backtracking", "Bit Manipulation"],
    companies: ["amazon", "microsoft"],
    leetcodeUrl: "https://leetcode.com/problems/subsets/",
    status: "MERGE_WITH_EXISTING"
  },
  {
    title: "Permutations",
    slug: "permutations",
    description: "Return all possible permutations of a collection of distinct integers.",
    difficulty: "Medium",
    topics: ["Array", "Backtracking"],
    companies: ["amazon", "microsoft"],
    leetcodeUrl: "https://leetcode.com/problems/permutations/",
    status: "MERGE_WITH_EXISTING"
  },
  {
    title: "N-Queens",
    slug: "n-queens",
    description: "Place n queens on an n×n chessboard so that no two queens attack each other.",
    difficulty: "Hard",
    topics: ["Array", "Backtracking"],
    companies: ["amazon", "microsoft", "google"],
    leetcodeUrl: "https://leetcode.com/problems/n-queens/",
    status: "IMPORT"
  },

  // ═══ DESIGN / LRU CACHE ═══
  {
    title: "LRU Cache",
    slug: "lru-cache",
    description: "Design a data structure that follows the Least Recently Used cache eviction policy.",
    difficulty: "Medium",
    topics: ["Hash Table", "Linked List", "Design", "Doubly-Linked List"],
    companies: ["google", "amazon", "microsoft", "flipkart"],
    leetcodeUrl: "https://leetcode.com/problems/lru-cache/",
    status: "MERGE_WITH_EXISTING"
  },

  // ═══ SORTING ═══
  {
    title: "Sort Colors",
    slug: "sort-colors",
    description: "Sort an array of 0s, 1s, and 2s in-place using the Dutch national flag algorithm.",
    difficulty: "Medium",
    topics: ["Array", "Two Pointers", "Sorting"],
    companies: ["microsoft", "amazon"],
    leetcodeUrl: "https://leetcode.com/problems/sort-colors/",
    status: "MERGE_WITH_EXISTING"
  },
  {
    title: "Find First and Last Position of Element in Sorted Array",
    slug: "find-first-and-last-position-of-element-in-sorted-array",
    description: "Find the starting and ending position of a given target value in a sorted array.",
    difficulty: "Medium",
    topics: ["Array", "Binary Search"],
    companies: ["amazon", "microsoft"],
    leetcodeUrl: "https://leetcode.com/problems/find-first-and-last-position-of-element-in-sorted-array/",
    status: "IMPORT"
  },
  {
    title: "Search a 2D Matrix",
    slug: "search-a-2d-matrix",
    description: "Search for a target in a row-sorted and column-sorted 2D matrix.",
    difficulty: "Medium",
    topics: ["Array", "Binary Search", "Matrix"],
    companies: ["microsoft", "amazon"],
    leetcodeUrl: "https://leetcode.com/problems/search-a-2d-matrix/",
    status: "IMPORT"
  }
];

// Remove status field (internal manifest only) before writing JSON for ingestion
const ingestionData = questions.map(({ status, ...rest }) => rest);

// Print manifest summary
const importCount = questions.filter(q => q.status === 'IMPORT').length;
const mergeCount = questions.filter(q => q.status === 'MERGE_WITH_EXISTING').length;
console.log('=== APNA COLLEGE DSA IMPORT MANIFEST ===');
console.log('Total questions in manifest: ' + questions.length);
console.log('NEW questions to IMPORT: ' + importCount);
console.log('EXISTING questions to MERGE (add company refs): ' + mergeCount);

// Company distribution
const compDist = {};
questions.forEach(q => q.companies.forEach(c => compDist[c] = (compDist[c] || 0) + 1));
console.log('\nCompany question distribution:');
Object.entries(compDist).sort(([,a],[,b]) => b - a).forEach(([c, n]) => console.log('  ' + c + ': ' + n));

// Unique slugs check
const slugSet = new Set(questions.map(q => q.slug));
if (slugSet.size !== questions.length) {
  console.error('\nERROR: Duplicate slugs detected in manifest!');
  process.exit(1);
}
console.log('\nDuplicate slug check: PASSED (' + slugSet.size + ' unique slugs)');
console.log('\nWriting fixtures/questions_apna_college.json...');
fs.writeFileSync('fixtures/questions_apna_college.json', JSON.stringify(ingestionData, null, 2));
console.log('Done. Written ' + ingestionData.length + ' questions.');
