montage boss_[1-5].png -tile 5x1 -geometry 120x120+0+0 -background transparent boss_idle.png

montage boss_2.[1-3].png -tile 3x1 -geometry 120x120+0+0 -background transparent boss_attack.png

montage boss_growing_[0-4].png -tile 5x1 -geometry 120x120+0+0 -background transparent boss_growing.png

montage boss_idle.png boss_attack.png boss_growing.png boss_intimidation.png -tile 1x4 -geometry 600x120+0+0 -background transparent boss.png
