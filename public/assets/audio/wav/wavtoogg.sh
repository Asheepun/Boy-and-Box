rm ../*.ogg

for file in *.wav
do
	ffmpeg -i $file -acodec libvorbis ../$(basename $file .wav).ogg
done


