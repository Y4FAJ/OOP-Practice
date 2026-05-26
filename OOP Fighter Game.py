import random
class Fighter():
    def __init__(self,name,health,attack_power,burn_turns,curse_turns,petrified):
        self.name = name
        self.health = health
        self.attack_power = attack_power
        self.burn_turns = burn_turns
        self.curse_turns = curse_turns
        self.petrified = petrified    
    def show_stats(self):
        print("\n",self.name + " " + "| HP:" + " " + str(self.health) + " " + "| Attack:" + " " + str(self.attack_power))
        
    def heal(self):
        healed = (self.health // 2)
        self.health = self.health + healed
        if self.health > 100:
            self.health = 100
        print(self.name, "has healed by", healed)

    def apply_effects(self,enemy):
        if enemy.burn_turns > 0:
            enemy.health = enemy.health - 4 
            enemy.burn_turns = enemy.burn_turns - 1
            print (enemy.name, "lost an extra 4 health due to being burned. Turns remaining:", enemy.burn_turns)
        if enemy.curse_turns > 0:
            enemy.health = enemy.health - 3
            enemy.curse_turns = enemy.curse_turns - 1
            print (enemy.name, "lost an extra 3 health due to being cursed. Turns remaining:", enemy.curse_turns)
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
                    amount = random.randrange(0,4)
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
            amount =  random.randrange(0,4)
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
                    amount = random.randrange(0,3)
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
senku = Mage("Senku",100,25,0,0,0)  
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

while run:
    for i in catalog:
        i.show_stats()
        fight = input("Who should"+" "+i.name+" "+"attack? type e to end or heal to recover: \t")
        if fight == "e":
            for i in catalog:
                i.show_stats()
            run = False
            break
        elif fight == "heal":
            i.heal()
        elif i.health == 0:
            print("They are defeated so therefore can't attack or do anything - type e on next character to end")
        elif i.name == "Senku":
            fight = characters.get(fight)
            if fight == None:
                print("Fighter not found")
            else:
                i.petrify(fight)     
        else:
            fight = characters.get(fight)
            if fight == None:
                print("Fighter not found")
            else:
                i.attack(fight)