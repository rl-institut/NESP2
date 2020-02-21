def assign_visibility(visible_levels):
    display = []
    for level in ("national", "state", "village"):
        if level in visible_levels:
            display.append("show")
        else:
            display.append("hide")

    visibility = "n_{} s_{} v_{}".format(*display)

    if len(visible_levels) == 0:
        visibility = "sidebar-panel-item-hidden"
    return visibility


print(assign_visibility(()))