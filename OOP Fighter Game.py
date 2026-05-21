import random
class Fighter():
    def __init__(self,name,health,attack_power):
        self.name = name
        self.health = health
        self.attack_power = attack_power
    
    def show_stats(self):
        print("\n",self.name + " " + "| HP:" + " " + str(self.health) + " " + "| Attack:" + " " + str(self.attack_power))
        
    def heal(self):
        healed = (self.health // 2)
        self.health = self.health + healed
        if self.health > 100:
            self.health = 100
        print(self.name, "has healed by", healed)    

class Swordsman(Fighter):
    def __init__(self, name, health, attack_power):
        super().__init__(name, health, attack_power)
    
    def attack(self,enemy):
        hits = random.randrange(1,3)
        enemy.health = enemy.health - (self.attack_power*hits)
        print(self.name, "slashed", enemy.name, hits, "times")
        if enemy.health <= 0:
            enemy.health = 0
            print(enemy.name,"is defeated!")

class Mage(Fighter):
    def __init__(self, name, health, attack_power):
        super().__init__(name, health, attack_power)

    def attack(self,enemy):
        enemy.health = enemy.health - self.attack_power
        print(self.name, "used the unique spell Megiddo on", enemy.name)
        if enemy.health <= 0:
            enemy.health = 0
            print(enemy.name,"is defeated!")

    def petrify(self,enemy):
        enemy.health = enemy.health - self.attack_power
        print(self.name, "spoke 1 meter, 1 second into the petrification device and threw it at", enemy.name, "petrifying them for a split second")
        if enemy.health <= 0:
            enemy.health = 0
            print(enemy.name,"is defeated!")

class Brawler(Fighter):
    def __init__(self, name, health, attack_power):
        super().__init__(name, health, attack_power)
    
    def attack(self,enemy):
        enemy.health = enemy.health - self.attack_power
        print(self.name, "used the attack Red Hawk on", enemy.name)
        if enemy.health <= 0:
            enemy.health = 0
            print(enemy.name,"is defeated!")


run = True
luffy = Brawler("Luffy",100,35) 
senku = Mage("Senku",100,25)  
asta = Swordsman("Asta",100,22) 
thorfinn = Swordsman("Thorfinn",100,20) 
rimuru = Mage("Rimuru",100,36)

catalog = [luffy,senku,asta,thorfinn,rimuru]
characters = {         #character dictionary
    "luffy":luffy,
    "senku":senku,
    "asta":asta,
    "thorfinn":thorfinn,
    "rimuru":rimuru
}

print("Characters you can pick are:")
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
            print("They are defeated so therefore can't attack - heal them or end game")
        elif i.name == "Senku":
                fight = characters.get(fight)
                i.petrify(fight)     
        else:
            fight = characters.get(fight)
            if fight == None:
                print("Fighter not found")
            else:
                i.attack(fight)