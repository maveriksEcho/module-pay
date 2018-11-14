<template>
    <section class="btcu-countdown">
        <span class="value">{{ theTime.hours }}</span> :
        <span class="value">{{ theTime.minutes }}</span> :
        <span class="value">{{ theTime.seconds }}</span>
    </section>
</template>

<script>
    export default {
        name: "countdown",
        props: ['deadline'],
        data() {
            return{
                hours: '',
                minutes: '',
                seconds: '',
            };
        },

        computed: {
            theTime(){
                var ctx = this;

                // Countdown loop
                var x =  setInterval(() =>{

                    // Difference between the 2 dates
                    var  now = new Date().getTime(),
                        diff = this.deadline - now,
                        // Time conversion to days, hours, minutes and seconds

                        thours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
                        tminutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
                        tseconds = Math.floor((diff % (1000 * 60)) / 1000);

                    // Keep 2 digits

                    this.hours = (thours < 10) ? '0' + thours : thours;
                    this.minutes = (tminutes < 10) ? '0' + tminutes : tminutes;
                    this.seconds = (tseconds < 10) ? '0' + tseconds : tseconds;

                    // Check for time expiration
                    if(diff < 0){
                        clearInterval(x);
                    }
                }, 1000);

                // Return data
                return {

                    hours: this.hours,
                    minutes: this.minutes,
                    seconds: this.seconds
                };
            }
        }
    }
</script>

<style>
 .btcu-countdown{
     font-size: 40px;
     width: 100%;
     text-align: center;
 }
</style>