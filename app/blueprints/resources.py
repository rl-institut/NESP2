from flask import Blueprint, render_template, abort, Markup, redirect, url_for

bp = Blueprint('resources', __name__)


@bp.route('/resources/<resc_name>')
def selection(resc_name=None):
    print(resc_name)
    return redirect(url_for("index"))