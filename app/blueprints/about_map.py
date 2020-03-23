from flask import Blueprint, render_template

bp = Blueprint('about-map', __name__)


@bp.route('/about-map')
def about():
    return render_template('about-map.html')
