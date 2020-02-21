def assign_visibility(visible_levels):
    """Selective display of sidebar-panel items

    :param visible_levels: a dict with ("national", "state", "village") as potential keys and (
    "hide", "show", "grey") as options. For "hide" the item will not be visible, for "show" it
    will be visible, for "grey" it will be visible but the user cannot use it
    :return: a formatted string with the appropriate classes for selective display
    """
    display = []
    for level in ("national", "state", "village"):
        if level in visible_levels:
            display.append(visible_levels[level])
        else:
            display.append("hide")

    visibility = "n_{} s_{} v_{}".format(*display)

    if len(visible_levels) == 0:
        visibility = "sidebar-panel-item-hidden"
    return visibility
