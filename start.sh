# Setup and export pin 23 for the sensor

cd /sys/class/gpio/
echo 23 > export
echo in > gpio23/direction
