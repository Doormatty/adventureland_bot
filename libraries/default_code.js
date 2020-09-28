load_code('DMCommon');
debug = false;
follow_leader = true;

if (party_leader) setInterval(party_manager, 10000); // Run every 10 seconds.


setInterval(function () {

	if (character.rip) return;

	use_hp_or_mp();
	loot();

	if (follow_leader) follow_the_leader();

	if (is_moving(character)) return;

	if (attack_mode) auto_battle();

}, 1000 / 4); // Loops every 1/4 seconds.
