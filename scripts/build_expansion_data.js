/* eslint-disable @typescript-eslint/no-require-imports */
// scripts/build_expansion_data.js
const fs = require('fs');

const questions = [
  // --- UPDATED EXISTING QUESTIONS WITH MULTIPLE COMPANY ASSOCIATIONS ---
  {
    title: "Two Sum",
    slug: "two-sum",
    description: "Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.",
    difficulty: "Easy",
    topics: ["Array", "Hash Table"],
    companies: ["google", "amazon", "deloitte", "zomato"],
    leetcodeUrl: "https://leetcode.com/problems/two-sum/"
  },
  {
    title: "Valid Palindrome",
    slug: "valid-palindrome",
    description: "A phrase is a palindrome if, after converting all uppercase letters into lowercase and removing non-alphanumeric characters, it reads the same forward and backward.",
    difficulty: "Easy",
    topics: ["Two Pointers", "String"],
    companies: ["google", "amazon", "microsoft", "deloitte"],
    leetcodeUrl: "https://leetcode.com/problems/valid-palindrome/"
  },
  {
    title: "Coin Change",
    slug: "coin-change",
    description: "Given an integer array of coins and an integer amount, compute the fewest number of coins needed to make up that amount, or -1 if impossible.",
    difficulty: "Medium",
    topics: ["Dynamic Programming", "Breadth-First Search"],
    companies: ["amazon", "microsoft", "infosys"],
    leetcodeUrl: "https://leetcode.com/problems/coin-change/"
  },
  {
    title: "LRU Cache",
    slug: "lru-cache",
    description: "Design a data structure that follows the constraints of a Least Recently Used (LRU) cache supporting get and put in O(1) average time.",
    difficulty: "Medium",
    topics: ["Hash Table", "Linked List", "Design", "Doubly-Linked List"],
    companies: ["google", "amazon", "microsoft", "flipkart"],
    leetcodeUrl: "https://leetcode.com/problems/lru-cache/"
  },
  {
    title: "Median of Two Sorted Arrays",
    slug: "median-of-two-sorted-arrays",
    description: "Given two sorted arrays nums1 and nums2 of size m and n, return the median of the two sorted arrays in O(log(m+n)) runtime complexity.",
    difficulty: "Hard",
    topics: ["Array", "Binary Search", "Divide and Conquer"],
    companies: ["google", "microsoft", "flipkart"],
    leetcodeUrl: "https://leetcode.com/problems/median-of-two-sorted-arrays/"
  },

  // --- DELOITTE QUESTIONS ---
  {
    title: "Reverse String",
    slug: "reverse-string",
    description: "Write a function that reverses an array of characters in-place using O(1) extra memory.",
    difficulty: "Easy",
    topics: ["Two Pointers", "String"],
    companies: ["deloitte"],
    leetcodeUrl: "https://leetcode.com/problems/reverse-string/"
  },
  {
    title: "Contains Duplicate",
    slug: "contains-duplicate",
    description: "Given an integer array nums, return true if any value appears at least twice in the array, and return false if every element is distinct.",
    difficulty: "Easy",
    topics: ["Array", "Hash Table", "Sorting"],
    companies: ["deloitte"],
    leetcodeUrl: "https://leetcode.com/problems/contains-duplicate/"
  },
  {
    title: "Valid Anagram",
    slug: "valid-anagram",
    description: "Given two strings s and t, return true if t is an anagram of s, and false otherwise.",
    difficulty: "Easy",
    topics: ["Hash Table", "String", "Sorting"],
    companies: ["deloitte"],
    leetcodeUrl: "https://leetcode.com/problems/valid-anagram/"
  },
  {
    title: "Merge Two Sorted Lists",
    slug: "merge-two-sorted-lists",
    description: "Merge two sorted linked lists and return it as a new sorted list consisting of the nodes of the first two lists.",
    difficulty: "Easy",
    topics: ["Linked List", "Recursion"],
    companies: ["deloitte"],
    leetcodeUrl: "https://leetcode.com/problems/merge-two-sorted-lists/"
  },
  {
    title: "Maximum Subarray",
    slug: "maximum-subarray",
    description: "Given an integer array nums, find the contiguous subarray with the largest sum and return its sum.",
    difficulty: "Medium",
    topics: ["Array", "Divide and Conquer", "Dynamic Programming"],
    companies: ["deloitte"],
    leetcodeUrl: "https://leetcode.com/problems/maximum-subarray/"
  },
  {
    title: "Best Time to Buy and Sell Stock",
    slug: "best-time-to-buy-and-sell-stock",
    description: "Given an array of daily stock prices, maximize profit by choosing a single day to buy and a different future day to sell.",
    difficulty: "Easy",
    topics: ["Array", "Dynamic Programming"],
    companies: ["deloitte"],
    leetcodeUrl: "https://leetcode.com/problems/best-time-to-buy-and-sell-stock/"
  },
  {
    title: "Missing Number",
    slug: "missing-number",
    description: "Given an array nums containing n distinct numbers in the range [0, n], return the only number in the range that is missing.",
    difficulty: "Easy",
    topics: ["Array", "Hash Table", "Math", "Bit Manipulation"],
    companies: ["deloitte"],
    leetcodeUrl: "https://leetcode.com/problems/missing-number/"
  },
  {
    title: "Single Number",
    slug: "single-number",
    description: "Given a non-empty array of integers nums where every element appears twice except for one, find that single one.",
    difficulty: "Easy",
    topics: ["Array", "Bit Manipulation"],
    companies: ["deloitte"],
    leetcodeUrl: "https://leetcode.com/problems/single-number/"
  },
  {
    title: "Intersection of Two Arrays",
    slug: "intersection-of-two-arrays",
    description: "Given two integer arrays nums1 and nums2, return an array of their intersection where each element in the result is unique.",
    difficulty: "Easy",
    topics: ["Array", "Hash Table", "Two Pointers", "Binary Search"],
    companies: ["deloitte"],
    leetcodeUrl: "https://leetcode.com/problems/intersection-of-two-arrays/"
  },
  {
    title: "Linked List Cycle",
    slug: "linked-list-cycle",
    description: "Given the head of a linked list, determine if the linked list has a cycle in it using Floyd's cycle-finding algorithm.",
    difficulty: "Easy",
    topics: ["Hash Table", "Linked List", "Two Pointers"],
    companies: ["deloitte"],
    leetcodeUrl: "https://leetcode.com/problems/linked-list-cycle/"
  },
  {
    title: "Remove Duplicates from Sorted Array",
    slug: "remove-duplicates-from-sorted-array",
    description: "Given an integer array nums sorted in non-decreasing order, remove duplicates in-place such that each unique element appears once.",
    difficulty: "Easy",
    topics: ["Array", "Two Pointers"],
    companies: ["deloitte"],
    leetcodeUrl: "https://leetcode.com/problems/remove-duplicates-from-sorted-array/"
  },
  {
    title: "Fibonacci Number",
    slug: "fibonacci-number",
    description: "The Fibonacci numbers form a sequence such that each number is the sum of the two preceding ones; calculate F(n).",
    difficulty: "Easy",
    topics: ["Math", "Dynamic Programming", "Recursion", "Memoization"],
    companies: ["deloitte"],
    leetcodeUrl: "https://leetcode.com/problems/fibonacci-number/"
  },
  {
    title: "Climbing Stairs",
    slug: "climbing-stairs",
    description: "You are climbing a staircase that takes n steps to reach the top. Each time you can climb 1 or 2 steps. In how many distinct ways can you climb to the top?",
    difficulty: "Easy",
    topics: ["Math", "Dynamic Programming", "Memoization"],
    companies: ["deloitte"],
    leetcodeUrl: "https://leetcode.com/problems/climbing-stairs/"
  },
  {
    title: "Valid Parentheses",
    slug: "valid-parentheses",
    description: "Given a string s containing just the characters '(', ')', '{', '}', '[' and ']', determine if the input string is valid.",
    difficulty: "Easy",
    topics: ["String", "Stack"],
    companies: ["deloitte"],
    leetcodeUrl: "https://leetcode.com/problems/valid-parentheses/"
  },
  {
    title: "Majority Element",
    slug: "majority-element",
    description: "Given an array nums of size n, return the majority element that appears more than ⌊n / 2⌋ times using Boyer-Moore Voting.",
    difficulty: "Easy",
    topics: ["Array", "Hash Table", "Divide and Conquer", "Counting"],
    companies: ["deloitte"],
    leetcodeUrl: "https://leetcode.com/problems/majority-element/"
  },
  {
    title: "Search in Rotated Sorted Array",
    slug: "search-in-rotated-sorted-array",
    description: "Given an integer array sorted in ascending order and rotated at an unknown pivot, find the index of target in O(log n) time.",
    difficulty: "Medium",
    topics: ["Array", "Binary Search"],
    companies: ["deloitte"],
    leetcodeUrl: "https://leetcode.com/problems/search-in-rotated-sorted-array/"
  },
  {
    title: "Find Peak Element",
    slug: "find-peak-element",
    description: "A peak element is an element that is strictly greater than its neighbors. Find a peak element and return its index in O(log n) time.",
    difficulty: "Medium",
    topics: ["Array", "Binary Search"],
    companies: ["deloitte"],
    leetcodeUrl: "https://leetcode.com/problems/find-peak-element/"
  },
  {
    title: "Longest Common Prefix",
    slug: "longest-common-prefix",
    description: "Write a function to find the longest common prefix string amongst an array of strings, returning empty string if none exists.",
    difficulty: "Easy",
    topics: ["String", "Trie"],
    companies: ["deloitte"],
    leetcodeUrl: "https://leetcode.com/problems/longest-common-prefix/"
  },
  {
    title: "First Unique Character in a String",
    slug: "first-unique-character-in-a-string",
    description: "Given a string s, find the first non-repeating character in it and return its index. If it does not exist, return -1.",
    difficulty: "Easy",
    topics: ["Hash Table", "String", "Queue", "Counting"],
    companies: ["deloitte"],
    leetcodeUrl: "https://leetcode.com/problems/first-unique-character-in-a-string/"
  },
  {
    title: "Move Zeroes",
    slug: "move-zeroes",
    description: "Given an integer array nums, move all 0's to the end of it while maintaining the relative order of the non-zero elements in-place.",
    difficulty: "Easy",
    topics: ["Array", "Two Pointers"],
    companies: ["deloitte"],
    leetcodeUrl: "https://leetcode.com/problems/move-zeroes/"
  },

  // --- INFOSYS QUESTIONS ---
  {
    title: "Longest Palindromic Substring",
    slug: "longest-palindromic-substring",
    description: "Given a string s, return the longest palindromic substring in s using dynamic programming or center expansion.",
    difficulty: "Medium",
    topics: ["String", "Dynamic Programming", "Two Pointers"],
    companies: ["infosys"],
    leetcodeUrl: "https://leetcode.com/problems/longest-palindromic-substring/"
  },
  {
    title: "Trapping Rain Water",
    slug: "trapping-rain-water",
    description: "Given n non-negative integers representing an elevation map where the width of each bar is 1, compute how much water it can trap after raining.",
    difficulty: "Hard",
    topics: ["Array", "Two Pointers", "Dynamic Programming", "Stack", "Monotonic Stack"],
    companies: ["infosys"],
    leetcodeUrl: "https://leetcode.com/problems/trapping-rain-water/"
  },
  {
    title: "House Robber",
    slug: "house-robber",
    description: "Determine the maximum amount of money you can rob tonight without alerting the police by avoiding robbing adjacent houses.",
    difficulty: "Medium",
    topics: ["Array", "Dynamic Programming"],
    companies: ["infosys"],
    leetcodeUrl: "https://leetcode.com/problems/house-robber/"
  },
  {
    title: "Kth Largest Element in an Array",
    slug: "kth-largest-element-in-an-array",
    description: "Given an integer array nums and an integer k, return the kth largest element in the array using a min-heap or Quickselect.",
    difficulty: "Medium",
    topics: ["Array", "Divide and Conquer", "Sorting", "Heap (Priority Queue)", "Quickselect"],
    companies: ["infosys"],
    leetcodeUrl: "https://leetcode.com/problems/kth-largest-element-in-an-array/"
  },
  {
    title: "Subarray Sum Equals K",
    slug: "subarray-sum-equals-k",
    description: "Given an array of integers nums and an integer k, return the total number of subarrays whose sum equals to k using prefix sums and hash map.",
    difficulty: "Medium",
    topics: ["Array", "Hash Table", "Prefix Sum"],
    companies: ["infosys"],
    leetcodeUrl: "https://leetcode.com/problems/subarray-sum-equals-k/"
  },
  {
    title: "Binary Tree Level Order Traversal",
    slug: "binary-tree-level-order-traversal",
    description: "Given the root of a binary tree, return the level order traversal of its nodes' values from left to right, level by level.",
    difficulty: "Medium",
    topics: ["Tree", "Breadth-First Search", "Binary Tree"],
    companies: ["infosys"],
    leetcodeUrl: "https://leetcode.com/problems/binary-tree-level-order-traversal/"
  },
  {
    title: "Word Break",
    slug: "word-break",
    description: "Given a string s and a dictionary of strings wordDict, return true if s can be segmented into a space-separated sequence of dictionary words.",
    difficulty: "Medium",
    topics: ["Hash Table", "String", "Dynamic Programming", "Trie", "Memoization"],
    companies: ["infosys"],
    leetcodeUrl: "https://leetcode.com/problems/word-break/"
  },
  {
    title: "Minimum Path Sum",
    slug: "minimum-path-sum",
    description: "Given a m x n grid filled with non-negative numbers, find a path from top left to bottom right which minimizes the sum of all numbers along its path.",
    difficulty: "Medium",
    topics: ["Array", "Dynamic Programming", "Matrix"],
    companies: ["infosys"],
    leetcodeUrl: "https://leetcode.com/problems/minimum-path-sum/"
  },
  {
    title: "Merge Intervals",
    slug: "merge-intervals",
    description: "Given an array of intervals where intervals[i] = [start_i, end_i], merge all overlapping intervals and return non-overlapping intervals.",
    difficulty: "Medium",
    topics: ["Array", "Sorting", "Intervals"],
    companies: ["infosys"],
    leetcodeUrl: "https://leetcode.com/problems/merge-intervals/"
  },
  {
    title: "Spiral Matrix",
    slug: "spiral-matrix",
    description: "Given an m x n matrix, return all elements of the matrix in spiral order traversing top, right, bottom, and left boundaries.",
    difficulty: "Medium",
    topics: ["Array", "Matrix", "Simulation"],
    companies: ["infosys"],
    leetcodeUrl: "https://leetcode.com/problems/spiral-matrix/"
  },
  {
    title: "Rotate Image",
    slug: "rotate-image",
    description: "You are given an n x n 2D matrix representing an image; rotate the image by 90 degrees clockwise in-place.",
    difficulty: "Medium",
    topics: ["Array", "Math", "Matrix"],
    companies: ["infosys"],
    leetcodeUrl: "https://leetcode.com/problems/rotate-image/"
  },
  {
    title: "Generate Parentheses",
    slug: "generate-parentheses",
    description: "Given n pairs of parentheses, write a function to generate all combinations of well-formed parentheses using backtracking.",
    difficulty: "Medium",
    topics: ["String", "Dynamic Programming", "Backtracking"],
    companies: ["infosys"],
    leetcodeUrl: "https://leetcode.com/problems/generate-parentheses/"
  },
  {
    title: "3Sum",
    slug: "3sum",
    description: "Given an integer array nums, return all the triplets [nums[i], nums[j], nums[k]] such that i != j, i != k, and j != k, and nums[i] + nums[j] + nums[k] == 0.",
    difficulty: "Medium",
    topics: ["Array", "Two Pointers", "Sorting"],
    companies: ["infosys"],
    leetcodeUrl: "https://leetcode.com/problems/3sum/"
  },
  {
    title: "Longest Consecutive Sequence",
    slug: "longest-consecutive-sequence",
    description: "Given an unsorted array of integers nums, return the length of the longest consecutive elements sequence in O(n) time using a HashSet.",
    difficulty: "Medium",
    topics: ["Array", "Hash Table", "Union Find"],
    companies: ["infosys"],
    leetcodeUrl: "https://leetcode.com/problems/longest-consecutive-sequence/"
  },
  {
    title: "Invert Binary Tree",
    slug: "invert-binary-tree",
    description: "Given the root of a binary tree, invert the tree by swapping left and right subtrees and return its root.",
    difficulty: "Easy",
    topics: ["Tree", "Depth-First Search", "Breadth-First Search", "Binary Tree"],
    companies: ["infosys"],
    leetcodeUrl: "https://leetcode.com/problems/invert-binary-tree/"
  },
  {
    title: "Maximum Depth of Binary Tree",
    slug: "maximum-depth-of-binary-tree",
    description: "Given the root of a binary tree, return its maximum depth as the number of nodes along the longest path from the root node down to the farthest leaf.",
    difficulty: "Easy",
    topics: ["Tree", "Depth-First Search", "Breadth-First Search", "Binary Tree"],
    companies: ["infosys"],
    leetcodeUrl: "https://leetcode.com/problems/maximum-depth-of-binary-tree/"
  },
  {
    title: "Number of Islands",
    slug: "number-of-islands",
    description: "Given an m x n 2D binary grid which represents a map of '1's (land) and '0's (water), return the number of islands using BFS or DFS.",
    difficulty: "Medium",
    topics: ["Array", "Depth-First Search", "Breadth-First Search", "Union Find", "Matrix"],
    companies: ["infosys"],
    leetcodeUrl: "https://leetcode.com/problems/number-of-islands/"
  },
  {
    title: "Min Cost Climbing Stairs",
    slug: "min-cost-climbing-stairs",
    description: "Given an integer array cost where cost[i] is the cost of ith step, find the minimum cost to reach the top of the floor.",
    difficulty: "Easy",
    topics: ["Array", "Dynamic Programming"],
    companies: ["infosys"],
    leetcodeUrl: "https://leetcode.com/problems/min-cost-climbing-stairs/"
  },
  {
    title: "Product of Array Except Self",
    slug: "product-of-array-except-self",
    description: "Given an integer array nums, return an array answer such that answer[i] is equal to the product of all elements of nums except nums[i] in O(n) without division.",
    difficulty: "Medium",
    topics: ["Array", "Prefix Sum"],
    companies: ["infosys"],
    leetcodeUrl: "https://leetcode.com/problems/product-of-array-except-self/"
  },
  {
    title: "Diameter of Binary Tree",
    slug: "diameter-of-binary-tree",
    description: "Given the root of a binary tree, return the length of the diameter of the tree as the longest path between any two nodes.",
    difficulty: "Easy",
    topics: ["Tree", "Depth-First Search", "Binary Tree"],
    companies: ["infosys"],
    leetcodeUrl: "https://leetcode.com/problems/diameter-of-binary-tree/"
  },
  {
    title: "Lowest Common Ancestor of a Binary Tree",
    slug: "lowest-common-ancestor-of-a-binary-tree",
    description: "Given a binary tree, find the lowest common ancestor (LCA) of two given nodes p and q in the tree.",
    difficulty: "Medium",
    topics: ["Tree", "Depth-First Search", "Binary Tree"],
    companies: ["infosys"],
    leetcodeUrl: "https://leetcode.com/problems/lowest-common-ancestor-of-a-binary-tree/"
  },

  // --- FLIPKART QUESTIONS ---
  {
    title: "LFU Cache",
    slug: "lfu-cache",
    description: "Design and implement a data structure for a Least Frequently Used (LFU) cache operating in O(1) time complexity for get and put operations.",
    difficulty: "Hard",
    topics: ["Hash Table", "Linked List", "Doubly-Linked List", "Design"],
    companies: ["flipkart"],
    leetcodeUrl: "https://leetcode.com/problems/lfu-cache/"
  },
  {
    title: "Sliding Window Maximum",
    slug: "sliding-window-maximum",
    description: "Given an array nums and sliding window of size k moving from left to right, return the max sliding window values using a monotonic deque.",
    difficulty: "Hard",
    topics: ["Array", "Queue", "Sliding Window", "Heap (Priority Queue)", "Monotonic Queue"],
    companies: ["flipkart"],
    leetcodeUrl: "https://leetcode.com/problems/sliding-window-maximum/"
  },
  {
    title: "Merge k Sorted Lists",
    slug: "merge-k-sorted-lists",
    description: "You are given an array of k linked-lists lists, each linked-list is sorted in ascending order; merge all into one sorted linked-list.",
    difficulty: "Hard",
    topics: ["Linked List", "Divide and Conquer", "Heap (Priority Queue)", "Merge Sort"],
    companies: ["flipkart"],
    leetcodeUrl: "https://leetcode.com/problems/merge-k-sorted-lists/"
  },
  {
    title: "Word Ladder",
    slug: "word-ladder",
    description: "Given two words, beginWord and endWord, and a dictionary wordList, return the number of words in the shortest transformation sequence from beginWord to endWord.",
    difficulty: "Hard",
    topics: ["Hash Table", "String", "Breadth-First Search"],
    companies: ["flipkart"],
    leetcodeUrl: "https://leetcode.com/problems/word-ladder/"
  },
  {
    title: "Course Schedule",
    slug: "course-schedule",
    description: "There are a total of numCourses you have to take, labeled from 0 to numCourses - 1. Determine if you can finish all courses given prerequisite pairs.",
    difficulty: "Medium",
    topics: ["Depth-First Search", "Breadth-First Search", "Graph", "Topological Sort"],
    companies: ["flipkart"],
    leetcodeUrl: "https://leetcode.com/problems/course-schedule/"
  },
  {
    title: "Course Schedule II",
    slug: "course-schedule-ii",
    description: "Given the total number of courses and a list of prerequisite pairs, return the ordering of courses you should take to finish all courses using topological sorting.",
    difficulty: "Medium",
    topics: ["Depth-First Search", "Breadth-First Search", "Graph", "Topological Sort"],
    companies: ["flipkart"],
    leetcodeUrl: "https://leetcode.com/problems/course-schedule-ii/"
  },
  {
    title: "Rotting Oranges",
    slug: "rotting-oranges",
    description: "Given an m x n grid containing fresh and rotten oranges, return the minimum number of minutes that must elapse until no cell has a fresh orange.",
    difficulty: "Medium",
    topics: ["Array", "Breadth-First Search", "Matrix"],
    companies: ["flipkart"],
    leetcodeUrl: "https://leetcode.com/problems/rotting-oranges/"
  },
  {
    title: "Kth Smallest Element in a Sorted Matrix",
    slug: "kth-smallest-element-in-a-sorted-matrix",
    description: "Given an n x n matrix where each row and column is sorted in ascending order, find the kth smallest element in the matrix.",
    difficulty: "Medium",
    topics: ["Array", "Binary Search", "Sorting", "Heap (Priority Queue)", "Matrix"],
    companies: ["flipkart"],
    leetcodeUrl: "https://leetcode.com/problems/kth-smallest-element-in-a-sorted-matrix/"
  },
  {
    title: "Design Add and Search Words Data Structure",
    slug: "design-add-and-search-words-data-structure",
    description: "Design a data structure that supports adding new words and finding if a string matches any previously added string with '.' wildcard character support.",
    difficulty: "Medium",
    topics: ["String", "Depth-First Search", "Design", "Trie"],
    companies: ["flipkart"],
    leetcodeUrl: "https://leetcode.com/problems/design-add-and-search-words-data-structure/"
  },
  {
    title: "Find Median from Data Stream",
    slug: "find-median-from-data-stream",
    description: "The median is the middle value in an ordered integer list. Design a data structure that adds integers from a stream and calculates the median efficiently.",
    difficulty: "Hard",
    topics: ["Two Pointers", "Design", "Sorting", "Heap (Priority Queue)", "Data Stream"],
    companies: ["flipkart"],
    leetcodeUrl: "https://leetcode.com/problems/find-median-from-data-stream/"
  },
  {
    title: "Next Permutation",
    slug: "next-permutation",
    description: "A permutation of an array of integers is an arrangement of its members. Rearrange numbers into the lexicographically next greater permutation of numbers.",
    difficulty: "Medium",
    topics: ["Array", "Two Pointers"],
    companies: ["flipkart"],
    leetcodeUrl: "https://leetcode.com/problems/next-permutation/"
  },
  {
    title: "Minimum Window Substring",
    slug: "minimum-window-substring",
    description: "Given two strings s and t, return the minimum window substring of s such that every character in t (including duplicates) is included in the window.",
    difficulty: "Hard",
    topics: ["Hash Table", "String", "Sliding Window"],
    companies: ["flipkart"],
    leetcodeUrl: "https://leetcode.com/problems/minimum-window-substring/"
  },
  {
    title: "Daily Temperatures",
    slug: "daily-temperatures",
    description: "Given an array of integers temperatures represents daily temperatures, return an array answer such that answer[i] is the days you have to wait for warmer temperature.",
    difficulty: "Medium",
    topics: ["Array", "Stack", "Monotonic Stack"],
    companies: ["flipkart"],
    leetcodeUrl: "https://leetcode.com/problems/daily-temperatures/"
  },
  {
    title: "Serialize and Deserialize Binary Tree",
    slug: "serialize-and-deserialize-binary-tree",
    description: "Design an algorithm to serialize a binary tree to a string and deserialize that string back to the original tree structure.",
    difficulty: "Hard",
    topics: ["String", "Tree", "Depth-First Search", "Breadth-First Search", "Design", "Binary Tree"],
    companies: ["flipkart"],
    leetcodeUrl: "https://leetcode.com/problems/serialize-and-deserialize-binary-tree/"
  },
  {
    title: "Partition Equal Subset Sum",
    slug: "partition-equal-subset-sum",
    description: "Given an integer array nums, return true if you can partition the array into two subsets such that the sum of elements in both subsets is equal.",
    difficulty: "Medium",
    topics: ["Array", "Dynamic Programming"],
    companies: ["flipkart"],
    leetcodeUrl: "https://leetcode.com/problems/partition-equal-subset-sum/"
  },
  {
    title: "Top K Frequent Elements",
    slug: "top-k-frequent-elements",
    description: "Given an integer array nums and an integer k, return the k most frequent elements in any order using a hash map and bucket sort or heap.",
    difficulty: "Medium",
    topics: ["Array", "Hash Table", "Divide and Conquer", "Sorting", "Heap (Priority Queue)", "Bucket Sort", "Counting", "Quickselect"],
    companies: ["flipkart"],
    leetcodeUrl: "https://leetcode.com/problems/top-k-frequent-elements/"
  },
  {
    title: "Longest Increasing Subsequence",
    slug: "longest-increasing-subsequence",
    description: "Given an integer array nums, return the length of the longest strictly increasing subsequence in O(n log n) time.",
    difficulty: "Medium",
    topics: ["Array", "Binary Search", "Dynamic Programming"],
    companies: ["flipkart"],
    leetcodeUrl: "https://leetcode.com/problems/longest-increasing-subsequence/"
  },
  {
    title: "Edit Distance",
    slug: "edit-distance",
    description: "Given two strings word1 and word2, return the minimum number of operations required to convert word1 to word2 (insert, delete, or replace character).",
    difficulty: "Medium",
    topics: ["String", "Dynamic Programming"],
    companies: ["flipkart"],
    leetcodeUrl: "https://leetcode.com/problems/edit-distance/"
  },
  {
    title: "Search a 2D Matrix II",
    slug: "search-a-2d-matrix-ii",
    description: "Write an efficient algorithm that searches for a target value in an m x n integer matrix where rows and columns are sorted in ascending order.",
    difficulty: "Medium",
    topics: ["Array", "Binary Search", "Divide and Conquer", "Matrix"],
    companies: ["flipkart"],
    leetcodeUrl: "https://leetcode.com/problems/search-a-2d-matrix-ii/"
  },
  {
    title: "Gas Station",
    slug: "gas-station",
    description: "There are n gas stations along a circular route. Return the starting gas station index if you can travel around the circuit once clockwise.",
    difficulty: "Medium",
    topics: ["Array", "Greedy"],
    companies: ["flipkart"],
    leetcodeUrl: "https://leetcode.com/problems/gas-station/"
  },

  // --- ZOMATO QUESTIONS ---
  {
    title: "Valid Palindrome II",
    slug: "valid-palindrome-ii",
    description: "Given a string s, return true if the s can be palindrome after deleting at most one character from it.",
    difficulty: "Easy",
    topics: ["Two Pointers", "String", "Greedy"],
    companies: ["zomato"],
    leetcodeUrl: "https://leetcode.com/problems/valid-palindrome-ii/"
  },
  {
    title: "Sort Colors",
    slug: "sort-colors",
    description: "Given an array nums with n objects colored red, white, or blue, sort them in-place so that objects of the same color are adjacent using the Dutch National Flag algorithm.",
    difficulty: "Medium",
    topics: ["Array", "Two Pointers", "Sorting"],
    companies: ["zomato"],
    leetcodeUrl: "https://leetcode.com/problems/sort-colors/"
  },
  {
    title: "Group Anagrams",
    slug: "group-anagrams",
    description: "Given an array of strings strs, group the anagrams together in any order using sorted string keys or character frequency tuples.",
    difficulty: "Medium",
    topics: ["Array", "Hash Table", "String", "Sorting"],
    companies: ["zomato"],
    leetcodeUrl: "https://leetcode.com/problems/group-anagrams/"
  },
  {
    title: "K Closest Points to Origin",
    slug: "k-closest-points-to-origin",
    description: "Given an array of points where points[i] = [x_i, y_i] and an integer k, return the k closest points to the origin (0, 0) using Euclidean distance.",
    difficulty: "Medium",
    topics: ["Array", "Math", "Divide and Conquer", "Geometry", "Sorting", "Heap (Priority Queue)", "Quickselect"],
    companies: ["zomato"],
    leetcodeUrl: "https://leetcode.com/problems/k-closest-points-to-origin/"
  },
  {
    title: "Task Scheduler",
    slug: "task-scheduler",
    description: "Given a characters array tasks representing CPU tasks and a non-negative integer n cooling interval, return the least number of intervals to complete all tasks.",
    difficulty: "Medium",
    topics: ["Array", "Hash Table", "Greedy", "Sorting", "Heap (Priority Queue)", "Counting"],
    companies: ["zomato"],
    leetcodeUrl: "https://leetcode.com/problems/task-scheduler/"
  },
  {
    title: "Find All Duplicates in an Array",
    slug: "find-all-duplicates-in-an-array",
    description: "Given an integer array nums of length n where all integers are in the range [1, n] and each integer appears at most twice, return an array of all integers that appear twice in O(n) time and O(1) extra space.",
    difficulty: "Medium",
    topics: ["Array", "Hash Table", "Bit Manipulation"],
    companies: ["zomato"],
    leetcodeUrl: "https://leetcode.com/problems/find-all-duplicates-in-an-array/"
  },
  {
    title: "Non-overlapping Intervals",
    slug: "non-overlapping-intervals",
    description: "Given an array of intervals intervals where intervals[i] = [start_i, end_i], return the minimum number of intervals you need to remove to make the rest of the intervals non-overlapping.",
    difficulty: "Medium",
    topics: ["Array", "Dynamic Programming", "Greedy", "Sorting", "Intervals"],
    companies: ["zomato"],
    leetcodeUrl: "https://leetcode.com/problems/non-overlapping-intervals/"
  },
  {
    title: "Maximum Product Subarray",
    slug: "maximum-product-subarray",
    description: "Given an integer array nums, find a subarray that has the largest product, and return the product tracking both minimum and maximum prefix products.",
    difficulty: "Medium",
    topics: ["Array", "Dynamic Programming"],
    companies: ["zomato"],
    leetcodeUrl: "https://leetcode.com/problems/maximum-product-subarray/"
  },
  {
    title: "Reorder List",
    slug: "reorder-list",
    description: "You are given the head of a singly linked-list; reorder the list to be L0 → Ln → L1 → Ln-1 → L2 → Ln-2 → ... in-place.",
    difficulty: "Medium",
    topics: ["Linked List", "Two Pointers", "Stack", "Recursion"],
    companies: ["zomato"],
    leetcodeUrl: "https://leetcode.com/problems/reorder-list/"
  },
  {
    title: "Word Search",
    slug: "word-search",
    description: "Given an m x n grid of characters board and a string word, return true if word exists in the grid using depth-first search backtracking.",
    difficulty: "Medium",
    topics: ["Array", "String", "Backtracking", "Matrix"],
    companies: ["zomato"],
    leetcodeUrl: "https://leetcode.com/problems/word-search/"
  },
  {
    title: "Combination Sum",
    slug: "combination-sum",
    description: "Given an array of distinct integers candidates and a target integer target, return a list of all unique combinations of candidates where the chosen numbers sum to target.",
    difficulty: "Medium",
    topics: ["Array", "Backtracking"],
    companies: ["zomato"],
    leetcodeUrl: "https://leetcode.com/problems/combination-sum/"
  },
  {
    title: "Subsets",
    slug: "subsets",
    description: "Given an integer array nums of unique elements, return all possible subsets (the power set) with no duplicate subsets.",
    difficulty: "Medium",
    topics: ["Array", "Backtracking", "Bit Manipulation"],
    companies: ["zomato"],
    leetcodeUrl: "https://leetcode.com/problems/subsets/"
  },
  {
    title: "Permutations",
    slug: "permutations",
    description: "Given an array nums of distinct integers, return all the possible permutations in any order using recursive backtracking.",
    difficulty: "Medium",
    topics: ["Array", "Backtracking"],
    companies: ["zomato"],
    leetcodeUrl: "https://leetcode.com/problems/permutations/"
  },
  {
    title: "Kth Largest Element in a Stream",
    slug: "kth-largest-element-in-a-stream",
    description: "Design a class to find the kth largest element in a stream. Note that it is the kth largest element in the sorted order, not the kth distinct element.",
    difficulty: "Easy",
    topics: ["Tree", "Design", "Binary Search Tree", "Heap (Priority Queue)", "Binary Tree", "Data Stream"],
    companies: ["zomato"],
    leetcodeUrl: "https://leetcode.com/problems/kth-largest-element-in-a-stream/"
  },
  {
    title: "Validate Binary Search Tree",
    slug: "validate-binary-search-tree",
    description: "Given the root of a binary tree, determine if it is a valid binary search tree (BST) where all left subtree keys are strictly less and right keys strictly greater.",
    difficulty: "Medium",
    topics: ["Tree", "Depth-First Search", "Binary Search Tree", "Binary Tree"],
    companies: ["zomato"],
    leetcodeUrl: "https://leetcode.com/problems/validate-binary-search-tree/"
  },
  {
    title: "Clone Graph",
    slug: "clone-graph",
    description: "Given a reference of a node in a connected undirected graph, return a deep copy (clone) of the graph using a hash map to map original nodes to cloned nodes.",
    difficulty: "Medium",
    topics: ["Hash Table", "Depth-First Search", "Breadth-First Search", "Graph"],
    companies: ["zomato"],
    leetcodeUrl: "https://leetcode.com/problems/clone-graph/"
  },
  {
    title: "Pacific Atlantic Water Flow",
    slug: "pacific-atlantic-water-flow",
    description: "There is an m x n rectangular island that borders both the Pacific Ocean and Atlantic Ocean. Return a 2D list of grid coordinates where water can flow to both oceans.",
    difficulty: "Medium",
    topics: ["Array", "Depth-First Search", "Breadth-First Search", "Matrix"],
    companies: ["zomato"],
    leetcodeUrl: "https://leetcode.com/problems/pacific-atlantic-water-flow/"
  },
  {
    title: "Decode Ways",
    slug: "decode-ways",
    description: "A message containing letters from A-Z can be encoded into numbers using mapping 'A' -> '1' to 'Z' -> '26'. Given a string s containing only digits, return the number of ways to decode it.",
    difficulty: "Medium",
    topics: ["String", "Dynamic Programming"],
    companies: ["zomato"],
    leetcodeUrl: "https://leetcode.com/problems/decode-ways/"
  },
  {
    title: "Jump Game",
    slug: "jump-game",
    description: "You are given an integer array nums where nums[i] denotes your maximum jump length from that position. Return true if you can reach the last index.",
    difficulty: "Medium",
    topics: ["Array", "Dynamic Programming", "Greedy"],
    companies: ["zomato"],
    leetcodeUrl: "https://leetcode.com/problems/jump-game/"
  },
  {
    title: "Palindromic Substrings",
    slug: "palindromic-substrings",
    description: "Given a string s, return the number of palindromic substrings in it using center expansion or dynamic programming.",
    difficulty: "Medium",
    topics: ["Two Pointers", "String", "Dynamic Programming"],
    companies: ["zomato"],
    leetcodeUrl: "https://leetcode.com/problems/palindromic-substrings/"
  }
];

fs.writeFileSync('fixtures/questions_expansion.json', JSON.stringify(questions, null, 2));
console.log('Successfully wrote', questions.length, 'questions to fixtures/questions_expansion.json');
