import os; base=r'E:\code\myAiPro\kidForWorkBuddy'; [print(f) for f in os.listdir(base) if f.endswith('.md') or 'PRD' in f.upper()] 
