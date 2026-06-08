# FLOORTASY
## functional requirements
- each User choses 2 defenders, 3 atackers (these two 2x, because everybody will be chosing two lines) + one goalkeeper
- User will chose his captain (he will get double points)
- User can chose new lineup for each matchday, once matchday started he cant change his players, before that he can edit his lineup. If he doesnt change anything, he will have same lineup as last matchday
- Scoring will be like this: 

### For all player:
Playing in the match: +1 point
Penalty: -3 points
MVP: +4 points
Scouting bonus: if player, that was chosen by less than 5% of other players wins a game, you get additional 

### For attackers:
Goal: +3 points
Assist: +2 poins
Hattrick: +2 (so 9 points for goals +2 additional)

### For defenders:
Goal: +4 points
Assist: +2 poins
Hattrick: +3 (so 12 points for goals +3 additional)
Clean sheet: +2 points

### For goalkeepers
Goal: +10 points
Assist: +8 points
Clean sheet: +6 points
Every 5 saves: +1 point
More than 90% save rate: +2 points
Goal conceded: -1 point
Won match in normal time: +2
Lost match: -2
Win in extra time: +1
Lose in extra time: -1

- User will have 100m for each round. Player will cost different
- You can have maximum of 3 players from the same club
- there will be global ranking
- users can also create their own group
- SUPABASE will be used so when you need anything - e.g. sign in you can just tell me
- there has to be filtering for players
- players will have their own stats - e.g. goals they scored, points, % of managers owning him
- you can see teams from other players only after the matchday starts (or see the teams from history).
- when you looking at your team, or scouting some players there has to be possibility to see %picked, price, date of the game, oponent in that game, maybe some avg. points. That doesnt mean everything has to be visible at once, there can be some filter etc.

non-functional & ui requirements

    The application must be strictly designed as Mobile-first (using a bottom navigation bar for main categories)

    UI will be Dark mode only (e.g., zinc-950 background)

    Typography: Use a monospace technical font (e.g., JetBrains Mono, IBM Plex Mono) to ensure tabular numbers align perfectly and the app looks professional without emojis
    

I will use Supabase so if you need any api or something like that just let me know. We dont have to connect application to database at first

I want to use Next.js, Dont use Bootstrap or emoji, you can use Tailwind CSS or some similar technology that you think is good ot have. For now 

If you have any questions, dont be shy to ask

- you have some mock players in teams/players.csv