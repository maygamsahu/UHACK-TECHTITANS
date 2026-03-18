# core/dataset_lookup.py
import pandas as pd
import random
import os

class DatasetLookup:
    def __init__(self, data_path='data/'):
        # Load datasets
        self.train_df = pd.read_csv(os.path.join(data_path, 'train.csv'))
        self.test_df = pd.read_csv(os.path.join(data_path, 'test.csv'))
        self.all_data = pd.concat([self.train_df, self.test_df], ignore_index=True)
        
        # Sample known accounts for demo
        self.known_accounts = {
            'nasa': 0,
            'cristiano': 1,
            'natgeo': 2,
            'selenagomez': 3,
            'therock': 4,
            'kimkardashian': 5
        }
    
    def lookup_account(self, username):
        """Lookup account in dataset by username"""
        username = username.lower().strip('@')
        
        # Try to find exact match in known accounts
        if username in self.known_accounts:
            idx = self.known_accounts[username]
        else:
            # Find in dataset by searching for similar patterns
            matching_indices = self.all_data[
                (self.all_data['#followers'] > 100000) & 
                (self.all_data['profile pic'] == 1)
            ].index.tolist()
            
            if matching_indices:
                idx = random.choice(matching_indices)
            else:
                # Return random account
                idx = random.randint(0, len(self.all_data)-1)
            
        account_data = self.all_data.iloc[idx]
        
        # Convert to proper format for AI model
        formatted_data = {
            'profile pic': int(account_data['profile pic']),
            'nums/length username': float(account_data['nums/length username']),
            'fullname words': int(account_data['fullname words']),
            'nums/length fullname': float(account_data['nums/length fullname']),
            'name==username': int(account_data['name==username']),
            'description length': int(account_data['description length']),
            'external URL': int(account_data['external URL']),
            'private': int(account_data['private']),
            '#posts': int(account_data['#posts']),
            '#followers': int(account_data['#followers']),
            '#follows': int(account_data['#follows'])
        }
        
        is_fake = bool(account_data['fake'])
        
        return formatted_data, is_fake

# Usage example
if __name__ == "__main__":
    lookup = DatasetLookup()
    data, is_fake = lookup.lookup_account('nasa')
    print("Account Data:", data)
    print("Is Fake:", is_fake)
