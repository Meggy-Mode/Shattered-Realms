from flask import Blueprint, render_template, jsonify, request
from game.models import GameState, db

main = Blueprint('main', __name__)

@main.route('/')
def index():
    return render_template('index.html')

@main.route('/game')
def game():
    return render_template('game.html')

@main.route('/save', methods=['POST'])
def save_game():
    data = request.json
    game_state = GameState(
        player_position=data['playerPosition'],
        inventory=data['inventory'],
        quest_progress=data['questProgress'],
        faction_standings=data['factionStandings'],
        echo_crystals=data.get('echoCrystals', [])
    )
    db.session.add(game_state)
    db.session.commit()
    return jsonify({'status': 'success'})

@main.route('/load')
def load_game():
    game_state = GameState.query.order_by(GameState.id.desc()).first()
    if game_state:
        return jsonify({
            'playerPosition': game_state.player_position,
            'inventory': game_state.inventory,
            'questProgress': game_state.quest_progress,
            'factionStandings': game_state.faction_standings,
            'echoCrystals': game_state.echo_crystals
        })
    return jsonify({})