<template>
    <div>
        <ul class="buy_credits_list">
            <li v-for="cred in credits_packs">
                <input :id="'btcu_credits_pack_id_' + cred.id" :value="cred.id"
                       @click="request(cred.id, cred.price, cred.credits_count)" name="btcu_credits_pack_id" required
                       type="radio">
                <label :for="'btcu_credits_pack_id_' + cred.id" class="add_credits_btn">
                    <span :data-amount="cred.credits_count*10" class="credits credits_value btcu-credits">{{(cred.credits_count*10).toFixed(2)}} TOKEN</span>
                    <span class="amount btcu-amount">
                                    $<div class="amount_value">{{cred.price}}</div>
                <span class="discount" v-if="discount">{{Math.round((cred.credits_count - cred.price) / cred.price * 100)}}% Discount</span>

                                </span>
                    <span class="choose btcu-choose">
                                    choose cripto
                                </span>
                </label>
            </li>
        </ul>

        <div class="btcu-container" v-if="show">
            <label class="btcu-modal-background"></label>

            <div class="btcu-modal-content">
                <div class="btcu-modal-header">
                    <label @click="show = false" class="btcu-modal-close">&#10005;</label>
                   <!-- <label @click="message = !message" class="btcu-modal-message">
                        <i class="fa fa-comment"></i>
                    </label>-->

                    <transition name="slide-fade">
                        <div v-show="message">
                            <textarea class="btcu-textariaFeedback"
                                      placeholder="Here you can write a message to our support team." rows="7"
                                      v-model="feedback.text"></textarea>
                        </div>

                    </transition>
                    <button @click="sendMessage(),message = false" class="btcu-sendFeedback" v-if="message">Send
                        message
                    </button>

                    <div style="position: fixed; right: 55px; text-align: right; " v-show="step === 1 && !message">
                        <div>{{amount}}$</div>
                        <div>{{token*10}} TOKEN</div>
                    </div>

                    <div v-show="step === 2 && !message">
                        <div style="float: left;">Order #{{order_id}}</div>
                        <div style="float: right; text-align: right">

                            <div>{{(btc).toFixed(8)}} BTC</div>
                            <div>{{amount}}$</div>
                        </div>
                    </div>

                </div>
                <countdown :deadline="time" v-if="step === 2"></countdown>
                <div class="btcu-modal-body">
                    <!--

                                                                STEP 1

                 -->
                    <div v-if="step === 1">
                        <h2>Select payment currency</h2>

                        <div :class="selected === 'btc' ? 'btcu-selected' : ''" @click="select('btc')"
                             class="btcu-currency-card">
                            <i class="fa fa-btc fa-cus-form"></i>
                            <div class="btcu-currency">
                                <span>Bitcoin</span>
                                <span>{{(btc).toFixed(8)}} btc</span>
                            </div>
                        </div>
                        <div :class="selected === 'btcln' ? 'btcu-selected' : ''" @click="select('btcln')"
                             class="btcu-currency-card">
                            <i class="fa fa-bolt fa-cus-form"></i>
                            <div class="btcu-currency">
                                <span>Bitcoin Lighting</span>
                                <span>{{(btc).toFixed(8)}} btc</span>
                            </div>
                        </div>
                        <!--<div class="btcu-currency-card">Other cripto</div>
                      <ul>
                         <li>1</li>
                         <li>2</li>
                       </ul>-->
                        <button :disabled="selected === ''" @click="loading=true ; requestpay()"
                                class="btcu-modal-content-button">Pay {{selected == 'btc' ? 'with Bitcoin' : ''}}
                            {{selected == 'btcln' ? 'with Bitcoin Lighting' : ''}}
                            <i class="fa fa-cog fa-spin" v-show="loading"></i></button>
                    </div>
                    <!--

                                                                 STEP 2

                     -->
                    <div v-if="step === 2">
                        <div class="btcu-qr-code">
                            <img :src="payment.qr" alt="qr-code" v-show="payment.show_qrcode == true">

                            <img :src="payment.peer" alt="peer" v-if="payment.peer_code"
                                 v-show="payment.show_qrpeer == true">
                        </div>

                        <div>
                            <p style="font-size: 12px; text-align: center; margin-top: 30px">
                                Send the indicated amount to the address below
                            </p>

                            <div style="height: 50px">
                                <div style="font-size: 15px; text-align: center; margin-top: 5px; color:#27ae60;"
                                     v-show="loading">
                                    {{status}}
                                </div>
                                <i class="fa fa-cog fa-spin"
                                   style="text-align: center; display: block; font-size: 15px; color:#27ae60; "
                                   v-show="loading"></i>

                            </div>

                            <!-- QR-CODE  -->

                            <div class="btcu-payment-cart">
                                <div class="btcu-payment">
                                    <span>BTC</span>
                                    <input id="btcu-qr" readonly type="text" v-model="payment.qr_code">
                                    <button @click="payment.show_qrcode = !payment.show_qrcode, payment.show_qrpeer = false">
                                        <i class="fa fa-qrcode"></i></button>
                                    <button @click="copyCode()"><i class="fa fa-copy"></i></button>
                                </div>

                                <!-- PEER  -->

                                <div class="btcu-payment" v-if="payment.peer_code">
                                    <span>PEER</span>
                                    <input id="btcu-peer" readonly type="text" v-model="payment.peer_code">
                                    <button @click="payment.show_qrpeer = !payment.show_qrpeer, payment.show_qrcode = false">
                                        <i class="fa fa-qrcode"></i></button>
                                    <button @click="copyPeer()"><i class="fa fa-copy"></i></button>
                                </div>
                            </div>
                        </div>
                    </div>
                    <!--

                                                                 STEP 3

                            -->
                    <div style="text-align: center;" v-if="step === 3">
                        <div>
                            Operation time: {{compliteTime}}
                        </div>
                        <h2 class="btcu-success">Thanks for using our service.</h2>
                        <div class="btcu-feedback-form" v-show="question != '' || show_rate">
                            <div>
                                <transition mode="out-in" name="fade">
                                    <div>
                                        <h3 v-show="qstep >= 0 && question != ''">Please answer the questions about the
                                            work of our service.</h3>
                                        <h3 v-show="qstep <  0 && feedback.rate >= 3">We really appreciate your
                                            opinion.</h3>
                                        <h3 v-show="qstep <  0 && feedback.rate < 3">We apologize and try to correct the
                                            situation as soon as possible.</h3>
                                    </div>
                                </transition>

                                <div v-for="(q,index) in question" v-if="question != ''">
                                    <transition mode="out-in" name="question">
                                        <div v-show="index == qstep">

                                            <h4>{{q.header}}</h4>
                                            <div v-for="(a, index) in q.answer">
                                                <input :value="index"
                                                       @click="nextquestion(), feedback.answer[qstep] = index"
                                                       name="feedback" type="radio">{{a}}
                                            </div>
                                            <br>
                                        </div>
                                    </transition>
                                </div>

                                <transition mode="out-in" name="fade">
                                    <div class="btcu-starRate">
                                        <div v-show="count() && show_rate">
                                            <p style="font-size: 10px;">Rate our service</p>
                                            <i :class="feedback.rate >= n ? 'btcu-feedback-active' : ''"
                                               @click="feedback.rate = n, sendFeedback()"
                                               class="fa fa-star"
                                               v-for="n in 5"></i>
                                            <p style="font-size: 10px;">Tap to rate</p>
                                        </div>
                                        <div v-show="qstep <  0">
                                            <i class="fa fa-smile-o" v-if="feedback.rate >= 3"></i>
                                            <i class="fa fa-meh-o" v-if="feedback.rate < 3"></i>
                                        </div>
                                    </div>
                                </transition>


                            </div>

                        </div>
                        <div style="font-size: 12px;text-align: center;margin: 10px 0 10px 0">
                            In case of problems with payment, please contact customer support.
                        </div>
                    </div>
                    <!--

                                                                 STEP 4

                   -->
                    <div v-if="step === 4">
                        <i class="fa fa-frown-o"></i>
                        <h2 class="btcu-error">{{error}}</h2>
                        <div style="font-size: 12px;text-align: center;margin: 10px 0 10px 0">
                            In case of problems with payment, please contact customer support.
                        </div>
                    </div>


                    <div class="btcu-modal-footer">
                        <div style="float: left">Create {{date}}</div>
                        <div style="float: right">Powered by <a href="https:\\btcu.ua">btcu.ua</a></div>

                    </div>
                </div>
            </div>
        </div>


    </div>
</template>

<script>
    import Countdown from './Countdown.vue'
    import 'v-toaster/dist/v-toaster.css'

    export default {
        name: 'app',
        components: {
            'countdown': Countdown
        },
        props: ['credits_packs', 'discount', 'email_confirm'],
        data: function () {
            return {
                loading: false,
                show: false,
                amount: '',
                credits_pack_id: '',
                selected: '',
                step: 1,
                token: '',
                payment: {
                    qr_code: '',
                    qr: '',
                    show_qrcode: true,
                    peer_code: null,
                    peer: '',
                    show_qrpeer: false,
                },
                order_id: '',
                date: new Date().toUTCString(),
                time: '',
                btc: '',
                error: 'Some errors',
                status: '',
                feedback: {
                    rate: 0,
                    answer: [],
                    text: '',
                },
                timer: {
                    start: '',
                    stop: ''
                },
                question: ''
                /*{
                    0: {
                        header: 'Is it convenient for you to use our service?',
                        answer: [
                            'YES',
                            'NO',
                        ]
                    },
                    1: {
                        header: 'would you like to pay with other cryptocurrencies?',
                        answer: [
                            'YES',
                            'NO',
                        ]
                    },

                }*/,
                qstep: 0,
                show_rate: true,
                message: false
            }
        },
        computed: {
            compliteTime: function () {
                let d = new Date(this.timer.stop - this.timer.start);
                let minutes = d.getMinutes();
                let seconds = d.getSeconds();
                minutes = (minutes < 10) ? '0' + minutes : minutes;
                seconds = (seconds < 10) ? '0' + seconds : seconds;
                return minutes + ':' + seconds
            }
        },
        methods: {
            request: function (id, price, token) {
                this.amount = price;
                this.credits_pack_id = id;
                this.token = token;
                this.loading = false;
                this.selected = '';
                this.qstep = 0;
                this.axios.get('/personal/balance/buy_credits_submit/', {
                    params: {
                        amount: this.amount,
                        credits_pack_id: this.credits_pack_id,
                        cripto: true
                    }
                }).then(response => {
                    console.log(response.data);
                    this.btc = response.data.btc;
                    this.show = true;
                    this.step = 1;

                }).catch(error => {
                    console.log(error.response);
                    this.error = error.response.data;
                    this.show = true;
                    this.step = 4;
                    if (error.response.status === 500) {
                        this.error = 'Widget off';
                    }
                })

            },
            requestpay: function () {
                this.time = new Date().setMilliseconds(12 * 60 * 60 * 1000);
                this.timer.start = Date.now();
                if (this.email_confirm !== 0) {
                    if (this.selected !== '') {
                        setTimeout(() => {
                            this.axios.get('/personal/balance/buy_credits_submit/', {
                                params: {
                                    amount: this.amount,
                                    credits_pack_id: this.credits_pack_id,
                                    selected: this.selected,
                                    cripto: true
                                }
                            }).then(response => {
                                console.log(response.data);
                                this.payment.qr_code = response.data.payment_request;
                                this.payment.qr = 'data:image/png;base64,' + response.data.qr;
                                this.payment.peer_code = response.data.peer_code;
                                this.payment.peer = 'data:image/png;base64,' + response.data.peer;
                                this.order_id = response.data.order_id;
                                this.btc = response.data.amount;
                                this.loading = false;
                                this.step = 2;
                                this.checkStatus();

                            }).catch(error => {
                                console.log(error.response);
                                this.error = error.response.data;
                                this.step = 4;
                                if (error.response.status === 500) {
                                    this.error = 'Widget off';
                                }
                            })
                        }, 500);
                    } else {
                        this.$toaster.error('Please select a currency to pay');
                        this.loading = false;
                    }
                } else {
                    this.$toaster.error('Please confirm email');
                    this.loading = false;
                }
            },
            checkStatus: function () {
                this.status = 'Сreating a new operation for payment.';
                this.loading = true;

                let status = setInterval(() => {
                    if (this.show === false) {
                        window.clearInterval(status);
                    } else {
                        this.axios.get('/personal/balance/buy_credits_submit/', {
                            params: {
                                order_id: this.order_id,
                                selected: this.selected,
                                cripto: true
                            }
                        }).then(response => {

                            console.log(response.data);
                            if (response.data.status === 1) {
                                this.status = 'Waiting for payment confirmation.';
                                this.loading = true;
                            }
                            if (response.data.status === 2) {
                                window.clearInterval(status);
                                this.loading = false;
                                this.step = 3;
                                this.timer.stop = Date.now();
                                this.show_rate = response.data.rate;
                                if (response.data.question) {
                                    this.question = response.data.question;
                                }

                            }
                            if (response.data.status === 3) {
                                window.clearInterval(status);
                                this.loading = false;
                                this.error = 'Operation canceled';
                                this.step = 4;
                            }

                        }).catch(error => {
                            console.log(error.response);
                            this.error = error.response.data;
                            window.clearInterval(status);
                            this.loading = false;
                            this.step = 4;
                        })
                    }
                }, 5000);

            },
            copyCode: function () {
                let testingCodeToCopy = document.querySelector('#btcu-qr');
                testingCodeToCopy.setAttribute('type', 'text');
                testingCodeToCopy.select();
                document.execCommand('copy');
                this.$toaster.success('Code copied successfully!');

            },
            copyPeer: function () {
                let testingCodeToCopy = document.querySelector('#btcu-peer');
                testingCodeToCopy.setAttribute('type', 'text');
                testingCodeToCopy.select();
                document.execCommand('copy');
                this.$toaster.success('Peer copied successfully!');

            },
            select: function (selected) {
                if (this.loading === false) {
                    this.selected = selected;
                }
            },
            sendFeedback: function () {
                setTimeout(() => {
                    this.qstep = -1;
                    this.axios.post('/personal/balance/buy_credits_submit', {
                        feedback: this.feedback,
                    }).then(response => {
                        console.log(response.data);
                        if (response.data.message) {
                            this.$toaster.warning(response.data.message);
                        }
                    }).catch(error => {
                        console.log(error.response);
                    })
                }, 1000)
            },
            sendMessage: function () {
                if (this.feedback.text !== '') {
                    this.axios.post('/personal/balance/buy_credits_submit', {
                        feedback: this.feedback,
                    }).then(response => {
                        console.log(response.data);
                        this.feedback.text = '';
                        if (response.data.message) {
                            this.$toaster.warning(response.data.message);
                        }
                    }).catch(error => {
                        console.log(error.response);
                    })
                } else {
                    this.$toaster.error('The message can not be empty');
                }
            },
            nextquestion: function () {
                setTimeout(() => {
                    this.qstep = this.qstep + 1
                }, 500)
            },
            count: function () {
                if(Object.keys(this.question).length <= this.qstep) {
                    return true
                }
                return false
            }
        }
    }
</script>

<style>
    .btcu-feedback-form h3, .btcu-feedback-form h4 {
        font-family: "Exo2Light", Arial, sans-serif;
        font-weight: 300;
        text-shadow: none;
    }

    .btcu-feedback-form h4 {
        font-size: 16px;

    }

    .btcu-starRate div {
        height: 100px;
    }

    .btcu-feedback-form input {
        margin: 10px
    }

    .btcu-feedback-form {
        height: 210px;
    }

    .btcu-textariaFeedback {
        position: relative;
        width: 100%;
        margin-top: 30px;
        min-height: 100%;
        resize: none;
        scroll: none
    }

    .btcu-sendFeedback {
        position: absolute;
        background-color: #337ab7;
        border-radius: 6px;
        border: 1px solid transparent;
        cursor: pointer;
        margin: 10px 0;
        padding: 10px 10px;
        right: 55px;
        color: white
    }

    .slide-fade-enter-active {
        transition: all .3s ease;
    }

    .slide-fade-leave-active {
        transition: all .0s cubic-bezier(1.0, 0.5, 0.8, 1.0);
    }

    .slide-fade-enter, .slide-fade-leave-to {
        transform: translateX(40px);
        opacity: 0;
    }

    .question-enter-active /* , .question-leave-active*/
    {
        transition: opacity .9s ease;
    }

    .question-enter, .question-leave-to {
        opacity: 0;
    }

    .question-leave-active {
        transition: opacity .0s;
    }


    .fade-enter-active, .fade-leave-active {
        transition: opacity .9s ease;
    }

    .fade-enter, .fade-leave-to {
        opacity: 0;
    }

    .btcu-feedback-active {
        color: red !important;
    }

    .fa-star {
        font-size: 40px;
        color: black;
        cursor: pointer;
    }

    .fa-thumbs-up, .fa-thumbs-down {
        font-size: 20px;
        text-align: center;
        margin: 10px 20px 10px 0;
        cursor: pointer;
    }

    .btcu-success {
        color: #27ae60;
        font-size: 25px;
        text-align: center;
    }

    .fa-meh-o {
        color: orange !important;
    }

    .fa-smile-o, .fa-meh-o {
        color: #27ae60;
        text-align: center;
        font-size: 90px;
        display: block;
    }

    .btcu-error {
        color: red;
        font-size: 25px;
        text-align: center;
    }

    .fa-frown-o {
        color: red;
        text-align: center;
        font-size: 70px;
        display: block;
    }

    .btcu-modal-footer div {
        font-size: 10px;
        color: #888;
        margin: 10px 0 0px 0
    }

    .buy_credits_list li label .btcu-credits {
        background: #9e933c;
    }

    .buy_credits_list li label .btcu-amount {
        background: #f0dd34;
    }

    .buy_credits_list li label .btcu-choose {
        background: #89d57f;
    }

    .btcu-qr-code {
        height: 150px;
        width: 150px;
        margin: 15px auto;
    }

    .btcu-payment button {
        border: 1px solid #f4e640;
        background-color: inherit;
        cursor: pointer;
        height: 30px;
        width: 30px;
    }

    .btcu-payment span {
        padding-top: 3px;
        width: 60px;
        border: 1px solid #f4e640;
        height: 30px;
        text-align: center;
    }

    .btcu-payment-cart {
        width: 100%;
        height: auto;
    }

    .btcu-payment {
        display: flex;
        flex: 1;
        align-items: center;
        height: 30px;
    }

    .btcu-payment input {
        height: 28px;
        width: -webkit-fill-available;
        border: 1px solid white;
    }

    .fa-cus-form {
        font-size: 40px;
        margin-right: 10px;
        width: 30px;
        text-align: center;
    }

    .btcu-modal-body, .btcu-modal-header {
        text-transform: uppercase;
        margin: 5px 40px 5px 40px;
    }

    .btcu-currency-card {
        display: flex;
        flex: 1;
        cursor: pointer;
        padding: 20px 16px 20px 16px;
        border: 1px solid #f4e640;
        margin-bottom: 10px;
    }

    .btcu-currency {
        display: flex;
        flex: 1;
        justify-content: space-between;
        align-items: center;
    }

    .btcu-currency-card span {
        font-size: 18px;
        line-height: 1;
        display: inline-block;
        vertical-align: middle;
    }

    .btcu-title-cripto {
        float: right;
        padding-top: 10px;
    }

    .btcu-selected, .btcu-currency-card:hover {
        background-color: #9e9243;
        color: #f0dd34;
    }

    .btcu-modal-header {
        margin-bottom: 20px;
        height: 40px;
    }

    .btcu-modal-footer {
        margin-top: 20px;
        height: 30px;
    }

    .btcu-modal-body {
        height: auto;
    }

    label {
        cursor: pointer;
        transition: all 250ms;
    }

    .btcu-container {
        font-family: "Exo2Light", Arial, sans-serif;
        position: relative;
        margin: 0 auto;
        padding: 50px;
    }

    .btcu-container h2 {
        font-weight: 100;
        text-align: center;
    }

    .btcu-container .btcu-modal-button {
        position: relative;
        display: block;
        font-size: 36px;
        font-weight: 300;
        color: #2980b9;
        text-align: center;
        line-height: 0.3;
        border-radius: 3px;
        transition: all 250ms;
    }

    .btcu-container .btcu-modal-button span {
        font-size: 20px;
    }

    .btcu-container .btcu-modal-button:hover, .btcu-container .btcu-modal-button:focus {
        color: #16a085;
        box-shadow: 0 0 10px rgba(0, 0, 0, 0.4);
    }

    .btcu-container .btcu-modal-content,
    .btcu-container .btcu-modal-background {
        visibility: hidden;
        width: 0;
        height: 0;
        opacity: 0;
        overflow: hidden;
        cursor: pointer;
    }

    .btcu-container .btcu-modal-background {
        transition: height 250ms;
    }

    .btcu-container .btcu-modal-content {
        transform: scale(0);
        transition: transform 500ms;
    }

    .btcu-container #btcu-modal {
        display: none;
    }

    .btcu-container .btcu-modal-background {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background-color: #89d57f;
        visibility: visible;
        opacity: 0.8;
        transition: height 250ms;
    }

    .btcu-container .btcu-modal-content {
        position: fixed;
        left: 50%;
        top: 50%;
        transform: translate(-50%, -50%);
        width: 550px;
        height: auto;
        padding: 20px;
        background-color: #f0dd34;
        color: #9e933c;
        visibility: visible;
        opacity: 1;
        pointer-events: auto;
        cursor: auto;
        transition: transform 500ms;
        box-shadow: -15px 20px #8ab472;
    }

    .btcu-container .btcu-modal-content .btcu-modal-close {
        position: absolute;
        top: 10px;
        right: 20px;
        font-size: 22px;
        color: rgba(51, 51, 51, 0.4);
        transition: color 200ms, transform 500ms;
    }

    .btcu-modal-message {
        position: absolute;
        top: 10px;
        left: 20px;
        font-size: 22px;
        color: rgba(51, 51, 51, 0.4);
        margin-right: 20px
    }

    .btcu-container .btcu-modal-content .btcu-modal-close:hover, .btcu-container .btcu-modal-content .btcu-modal-close:focus {
        color: #333;
        transform: rotate(360deg);
    }

    .btcu-container .btcu-modal-content p {
        position: relative;
        margin: 0 0 20px 0;
        font-weight: 200;
        font-size: 20px;
        line-height: 1.6;
    }

    .btcu-container .btcu-modal-content .btcu-modal-content-button {
        width: 100%;
        position: relative;
        float: right;
        margin: 10px 0 20px 0;
        padding: 10px 20px;
        color: white;
        font-weight: 100;
        background-color: #337ab7;
        border-radius: 6px;
        border: 1px solid transparent;
    }

    .btcu-container .btcu-modal-content .btcu-modal-content-button:hover, .btcu-container .btcu-modal-content .btcu-modal-content-button:focus {
        background-color: #409ad5;
    }
</style>
