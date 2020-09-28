var debug = false;
var attack_mode = false;
var party_leader = false;
var follow_leader = false;
var party_spacing = 30;
var leader_old_x = 0;
var leader_old_y = 0;


function f(value, places = 0) {
    return Number.parseFloat(value).toFixed(places);
}

function party_manager() {
    let online_chars = get_characters().filter((x) => x.online > 0).map((x) => x.name);
    for (let name in online_chars) {
        if (online_chars[name] === parent.character.name) {
            continue;
        }
        if (!is_in_party(online_chars[name])) {
            log(`${online_chars[name]} is online and not in party - sending invite.`);
            send_party_invite(online_chars[name])
        }
    }
}

function auto_battle(min_xp=100, max_att=160) {
    let target = get_targeted_monster();
    if (!target) {
        target = get_nearest_monster({min_xp: min_xp, max_att: max_att});
        if (target) {
            change_target(target);
        } else {
            set_message("No Monsters");
            return;
        }
    }

    if (!is_in_range(target)) {
        move(
            character.x + (target.x - character.x) / 2,
            character.y + (target.y - character.y) / 2
        );
        // Walk half the distance
    } else if (can_attack(target)) {
        set_message("Attacking");
        attack(target);
    }
}

function on_party_invite(name) {
    let online_chars = get_characters().filter((x) => x.online > 0).map((x) => x.name);
    if (online_chars.includes(name)) {
        log('accepting party invite');
        accept_party_invite(name);
    }
}

function is_in_party(name) {
    return Object.getOwnPropertyNames(parent.party).includes(name);
}

function get_party_leader() {
    return parent.character.party;
}

function get_position_in_party() {
    return Object.getOwnPropertyNames(parent.party).indexOf(parent.character.name)
}

function get_party_size() {
    return Object.getOwnPropertyNames(parent.party).length;
}

function follow_the_leader() {
    if (parent.character.party && parent.character.party !== parent.character.name) {
        let leader = get_player(parent.character.party);
        if (leader.x !== leader_old_x || leader.y !== leader_old_y) {

            // Todo: Add additional formations
            // Note: The formation y coords are "normal" (Down=-), unlike the game (Down=+)
            let formation = {
                2: [{x: 0, y: 0}, {x: 0, y: -1}],
                3: [{x: 0, y: 0}, {x: -1, y: -1}, {x: 1, y: -1}]
            };

            let new_pos = formation[get_party_size()][get_position_in_party()];
            if (debug) {
                log(`Pre Trans (${f(new_pos.x)},${f(new_pos.y)})`);
            }
            switch (leader.direction) {
                case 0: // Down
                    break
                case 1: // Left
                    new_pos = {x: 0 - new_pos.y, y: new_pos.x};
                    break
                case 2: // Right
                    new_pos = {x: new_pos.y, y: 0 - new_pos.x};
                    break
                case 3: // Up
                    new_pos.y = 0 - new_pos.y;
                    break
            }
            if (debug) {
                log(`Post Trans (${f(new_pos.x)},${f(new_pos.y)})`);
            }
            new_pos.x *= party_spacing;
            new_pos.y *= party_spacing;

            if (debug) {
                log(`After Spacing (${f(new_pos.x)},${f(new_pos.y)})`);
                log(`Leader Going (${f(leader.going_x)},${f(leader.going_y)})`);
            }
            new_pos.x += leader.going_x;
            new_pos.y += leader.going_y;
            if (debug) {
                log(`After Leader+(${f(new_pos.x)},${f(new_pos.y)})`);
            }


            if (debug) {
                log(`Leader Direction: ${leader.direction}`);
                log(`Leader Position: (${f(leader.x)},${f(leader.y)})`);
                log(`Moving to (${f(new_pos.x)},${f(new_pos.y)})`);
            }
            move(new_pos.x, new_pos.y);
        }
    }
}


