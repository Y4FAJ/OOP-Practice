import json
import random
class Fighter():
    def __init__(self,name,health,attack_power,burn_turns,curse_turns,petrified): #all in the fighters class will have these traits
        self.name = name
        self.health = health
        self.attack_power = attack_power
        self.burn_turns = burn_turns
        self.curse_turns = curse_turns
        self.petrified = petrified    
    
    def show_stats(self):
        print("\n",self.name,"| HP:",str(self.health),"| Attack:",str(self.attack_power))

    def end_stats(self):
        print("\n",self.name,"| HP:",str(self.health),"| Attack:",str(self.attack_power),"| Turns burnt:",str(self.burn_turns),"| Turns cursed:",str(self.curse_turns),"| Turns petrified:",str(self.petrified))
        
    def heal(self):
        healed = (self.health // 2)
        self.health = self.health + healed
        if self.health > 100:
            self.health = 100
        print(self.name, "has healed by", healed)

    def apply_effects(self,enemy): #applies effects to a character if called
        if enemy.burn_turns > 0:
            enemy.health = enemy.health - 3 
            enemy.burn_turns = enemy.burn_turns - 1
            print (enemy.name, "lost an extra 3 health due to being burned. Turns remaining:", enemy.burn_turns)
        if enemy.curse_turns > 0:
            enemy.health = enemy.health - 4
            enemy.curse_turns = enemy.curse_turns - 1
            print (enemy.name, "lost an extra 4 health due to being cursed. Turns remaining:", enemy.curse_turns)
        if self.petrified > 0:
            self.petrified = self.petrified - 1
            print(self.name,"has",self.petrified,"turns left of being partially petrified")
        if enemy.health <= 0:
                enemy.health = 0
                print(enemy.name,"is defeated!")


class Swordsman(Fighter):
    def __init__(self,name,health,attack_power,burn_turns,curse_turns,petrified):
        super().__init__(name,health,attack_power,burn_turns,curse_turns,petrified)
    
    def attack(self,enemy): 
        if self.petrified > 0: #Character attacking already has petrified status
            chance = random.randrange(1,3)
            if chance == 1: # prob of 1/2 of not attacking
                print(self.name, "couldn't attack due to being petrified!")
            else:
                hits = random.randrange(1,3)
                enemy.health = enemy.health - (self.attack_power*hits)
                print(self.name, "slashed", enemy.name, hits, "times")
        elif self.petrified == 0:
            hits = random.randrange(1,3)
            enemy.health = enemy.health - (self.attack_power*hits)
            print(self.name, "slashed", enemy.name, hits, "times")
        self.apply_effects(enemy)


class Mage(Fighter):
    def __init__(self,name,health,attack_power,burn_turns,curse_turns,petrified):
        super().__init__(name,health,attack_power,burn_turns,curse_turns,petrified)

    def attack(self,enemy): #rimuru's attack
        if self.petrified > 0: #Character attacking already has petrified status
            chance = random.randrange(1,3)
            if chance == 1: # prob of 1/2 of not attacking
                print(self.name, "couldn't attack due to being petrified!")
            else:
                enemy.health = enemy.health - self.attack_power
                print(self.name, "used the unique spell Megiddo on", enemy.name)
                if enemy.curse_turns == 0:
                    amount = random.randrange(0,4) #3/4 chance of being cursed
                    if amount > 0:
                        enemy.curse_turns = amount
                        print(enemy.name, "is now cursed for", amount,"turns")
        elif self.petrified == 0:
            enemy.health = enemy.health - self.attack_power
            print(self.name, "used the unique spell Megiddo on", enemy.name)
            if enemy.curse_turns == 0:
                amount = random.randrange(0,4)
                if amount > 0:
                    enemy.curse_turns = amount
                    print(enemy.name, "is now cursed for", amount,"turns")
        self.apply_effects(enemy)
                
    #Senku specific attack - can't be petrified himself unless he attacks himself
    def petrify(self,enemy):
        enemy.health = enemy.health - self.attack_power
        print(self.name, "spoke 1 meter, 1 second into the petrification device and threw it at", enemy.name)
        if enemy.petrified == 0:
            amount =  random.randrange(0,4) #3/4 chance of being petrified
            if amount > 0:
                enemy.petrified = amount
                print(enemy.name, "is partially petrified for", amount, "turns!")
        self.apply_effects(enemy)


class Brawler(Fighter):
    def __init__(self,name,health,attack_power,burn_turns,curse_turns,petrified):
        super().__init__(name,health,attack_power,burn_turns,curse_turns,petrified)
    
    def attack(self,enemy):
        if self.petrified > 0: #Character attacking already has petrified status
            chance = random.randrange(1,3)
            if chance == 1: # prob of 1/2 of not attacking
                print(self.name, "couldn't attack due to being petrified!")
            else:        
                enemy.health = enemy.health - self.attack_power
                print(self.name, "used the attack Red Hawk on", enemy.name)
                if enemy.burn_turns == 0:
                    amount = random.randrange(0,3) #2/3 chance of being burned
                    if amount > 0:
                        enemy.burn_turns = amount
                        print(enemy.name, "is now burned for", amount, "turns!")
        elif self.petrified == 0:
            enemy.health = enemy.health - self.attack_power
            print(self.name, "used the attack Red Hawk on", enemy.name)
            if enemy.burn_turns == 0:
                amount = random.randrange(0,3)
                if amount > 0:
                    enemy.burn_turns = amount
                    print(enemy.name, "is now burned for", amount, "turns!")
        self.apply_effects(enemy)



run = True
luffy = Brawler("Luffy",100,35,0,0,0) 
senku = Mage("Senku",100,30,0,0,0)  
asta = Swordsman("Asta",100,22,0,0,0) 
thorfinn = Swordsman("Thorfinn",100,20,0,0,0) 
rimuru = Mage("Rimuru",100,36,0,0,0)

catalog = [luffy,senku,asta,thorfinn,rimuru]
characters = {         #character dictionary
    "luffy":luffy,
    "senku":senku,
    "asta":asta,
    "thorfinn":thorfinn,
    "rimuru":rimuru
}

print("\nCharacters you can pick are:")
for i in catalog:
    print(i.name.lower(), "\n")

load = input("Type y if you would you like to load your last saved run:")
if load == "y":
    with open("fighters.json","r") as file:      
        for i in catalog:
            data = json.loads(str(file.readline())) #converts JSON text into python equivalent and reads what's at the line
            if data["name"] == i.name: #remakes the chracters with the stats saved
                i.name = data["name"]
                i.health = int(data["health"])
                i.attack_power = int(data["attack_power"])
                i.burn_turns = int(data["burn_turns"])
                i.curse_turns = int(data["curse_turns"])
                i.petrified = int(data["petrified"])
            i.end_stats()
else: print("Starting new run!")

while run:
    for i in catalog:
        i.show_stats()
        fight = input("Who should"+" "+i.name+" "+"attack? type e to end or heal to recover: \t")
        if fight == "e":
            for i in catalog:
                i.end_stats()
            save = input("type y if you would like to save the stats from this run:")
            if save == "y":
                with open("fighters.json","a") as file:
                        file.seek(0)
                        file.truncate() #clears last saved game stats
                for i in catalog:
                    data = {
                        "name": i.name,
                        "health": i.health,
                        "attack_power": i.attack_power,
                        "burn_turns": i.burn_turns,
                        "curse_turns": i.curse_turns,
                        "petrified": i.petrified
                    }
                    with open("fighters.json","a") as file:
                        file.write(json.dumps(data) + "\n") #saves current game stats
            else: print("Not saving run...")
            run = False
            break
        elif fight == "heal": #heals current character
            i.heal()
        elif i.health == 0:
            print("They are defeated so therefore can't attack or do anything - type e to end or play without this character")
        elif i.name == "Senku":
            fight = characters.get(fight) #looks in character dictionary to see if what user inputted exists in it
            if fight == None: #if input not in dictionary then fight=None
                print("Fighter not found")
            else:
                i.petrify(fight) #senku special attack
        else:
            fight = characters.get(fight)
            if fight == None:
                print("Fighter not found")
            else:
                i.attack(fight) #everyone elses attack