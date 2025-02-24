from game import db
import json

class GameState(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    player_position = db.Column(db.String(100))
    inventory = db.Column(db.Text)
    quest_progress = db.Column(db.Text)
    faction_standings = db.Column(db.Text)
    echo_crystals = db.Column(db.Text, default='[]')  # Store crystal data as JSON

    def __init__(self, player_position, inventory, quest_progress, faction_standings, echo_crystals=None):
        self.player_position = json.dumps(player_position)
        self.inventory = json.dumps(inventory)
        self.quest_progress = json.dumps(quest_progress)
        self.faction_standings = json.dumps(faction_standings)
        self.echo_crystals = json.dumps(echo_crystals if echo_crystals else [])