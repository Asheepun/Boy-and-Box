montage boss_[1-5].png -tile 5x1 -geometry 120x120+0+0 -background transparent boss_idle.png

montage boss_2.[1-3].png -tile 3x1 -geometry 120x120+0+0 -background transparent boss_attack.png

montage boss_idle.png boss_attack.png -tile 1x2 -geometry 600x120+0+0 -background transparent boss.png
