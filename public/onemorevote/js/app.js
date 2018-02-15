document.addEventListener("DOMContentLoaded", function() {
  Vue.component('progress-bar', {
    template: '#progress-bar-template',

    props: [ 'bars' ],

    data: function() {
      return {
        currentIndex: 0
      }
    },

    computed: {
      isDone: function() {
        return this.bars === this.currentIndex
      },
    },

    created: function() {
      var self = this;
      setTimeout(function(){
        self.animation = setInterval(self.animate, 25);
      }, 1000);
    },

    destroyed: function() {
      clearInterval(this.animation)
    },

    methods: {
      animate: function() {
        if (this.currentIndex < this.bars) {
          this.currentIndex += 1
        }
        else {
          clearInterval(this.animation)
        }
      }
    }
  });

  var app = new Vue({
    el: '#app',

    data: function() {
      return {
        name: null,
        email: null,
        zipCode: null,
        phone: null,
        hasLargeAudience: false,
        actionComment: null,
        isLoading: false,
        formMessage: null,
        modalVisible: false,
        isDemandProgressPage: false
        
      }
    },
    
    methods: {
      windowLocation: function(){
        var self= this; 
        self.isDemandProgressPage = window.location.href.indexOf('source=dp') !== -1
      },
      submitFormDp: function(event){
        var self = this
        const name = document.getElementById('name') 
        const nameRegex = /^[A-Za-z '.-]+$/.test(name.value)
        const email = document.getElementById('email')
        const emailRegex = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(email.value)
        const zipCode = document.getElementById('zipCode')
        
        
        if (!nameRegex) {
            name.focus()
            alert('Please enter your name')
            return
          }
        
        if (!emailRegex) {
            email.focus()
            alert('Please enter your email')
            return
          }
          
        if (!self.zipCode) {
          zipCode.focus()
          alert('Please enter your Zipcode')
          return
        } else if (self.zipCode.length < 5 || self.zipCode.length > 5) {
          zipCode.focus();
          alert('Please enter a valid Zipcode')
          return
        }

        const nameAlert = function(){
          name.focus()
          alert('Please enter your name')
          return
        }
        
        const emailAlert = function(){
          email.focus()
          alert('Please enter your email')
          return
        }
        
        const phoneAlert = function(){
          zipCode.focus();
          alert('Please enter your zipCode')
          return
        }
        
        const zipCodeAlert = function(){
          zipCode.focus();
          alert('Please enter your zipCode')
          return
        }
        
        const getQueryVariables = (function(){
          const variables = {};
          const queryString = location.search.substr(1);
          const pairs = queryString.split('&');
          
          for (let i = 0; i < pairs.length; i++) {
            const keyValue = pairs[i].split('=');
            variables[keyValue[0]] = keyValue[1];
          }
          
          return variables;
        }())
        
        const params = {
          name: self.name ? self.name.trim() : nameAlert(),
          phone: self.phone ? self.phone : phoneAlert(),
          email: self.email ? self.email : emailAlert(),
          zip: self.zipCode ? self.zipCode : zipCodeAlert(),
          page: 'one-more-vote',
          country: 'united states',
          form_name: 'act-petition',
          source: getQueryVariables || 'website',
          want_progress: 1,
          js: 1,
          opt_in: 1
        }
      
        // iFrame
        const iframe = document.createElement('iframe')
        iframe.style.display = 'none'
        iframe.setAttribute('name', 'actionkit-iframe')
        document.body.appendChild(iframe)
         
        // Form
        const form = document.createElement('form')
        form.style.display = 'none'
        form.setAttribute('action', 'https://act.demandprogress.org/act/')
        form.setAttribute('method', 'post')
        form.setAttribute('target', 'actionkit-iframe')
        document.body.appendChild(form)
        
        Object.keys(params).forEach(function(key) {
            const input = document.createElement('input')
            input.type = 'hidden'
            input.name = key
            input.value = params[key]
            form.appendChild(input)
        });  
        
        self.isLoading = true
        form.submit()
        
        setTimeout(function() { 
          self.isLoading = false
          self.resetForm()
          self.showModal()
        }, 5000)
      },
      submitForm: function() {
        var self = this;
        self.isLoading = true;
        self.$http.post('https://queue.fightforthefuture.org/action', {
          member: {
            first_name: self.name,
            email: self.email,
            postcode: self.zipCode,
            phone_number: self.phone,
            country: 'US'
          },
          hp_enabled: 'true',
          guard: '',
          contact_congress: 0,
          org: 'fftf',
          an_tags: "[\"net-neutrality\"]",
          an_petition_id: '11f84b38-e65b-4259-b0ae-e879a4044ca9',
          volunteer: self.hasLargeAudience,
          action_comment: self.actionComment
        }, { emulateJSON: true })
        .then(function(response){
          self.isLoading = false;

          if (response.ok) {
            self.resetForm();
            self.showModal();
          }
          else {
            self.formMessage = "That didn't work for some reason :(";
          }
        })
        .catch(function(error){
          self.isLoading = false;
          self.formMessage = "That didn't work for some reason :(";
        })
      },

      resetForm() {
        this.phone = null;
        this.name = null;
        this.email = null;
        this.zipCode = null;
        this.hasLargeAudience = false;
        this.actionComment = null;
        this.formMessage = null;
      },

      showModal: function() {
        this.modalVisible = true;
        document.querySelector('body').classList.add('modal-open');
      },

      hideModal: function() {
        this.modalVisible = false;
        document.querySelector('body').classList.remove('modal-open');
      },

      getMetaContent: function(name) {
        var el = document.querySelector('meta[name="' + name + '"]') || document.querySelector('meta[property="' + name + '"]');
        
        if (el) {
          return el.getAttribute('content');
        }

        return null;
      },

      openPopup: function(url, title='popup', w=600, h=500) {
        // Fixes dual-screen position
        var dualScreenLeft = window.screenLeft != undefined ? window.screenLeft : screen.left;
        var dualScreenTop = window.screenTop != undefined ? window.screenTop : screen.top;

        var width = window.innerWidth ? window.innerWidth : document.documentElement.clientWidth ? document.documentElement.clientWidth : screen.width;
        var height = window.innerHeight ? window.innerHeight : document.documentElement.clientHeight ? document.documentElement.clientHeight : screen.height;

        var left = ((width / 2) - (w / 2)) + dualScreenLeft;
        var top = ((height / 2) - (h / 2)) + dualScreenTop;
        var newWindow = window.open(url, title, 'scrollbars=yes, width=' + w + ', height=' + h + ', top=' + top + ', left=' + left);

        // Puts focus on the newWindow
        if (window.focus) {
          newWindow.focus();
        }
      },

      shareOnFacebook: function() {
        var url = this.getMetaContent('og:url');
        this.openPopup('https://www.facebook.com/sharer.php?u=' + encodeURIComponent(url), 'facebook');
      },

      shareOnTwitter: function() {
        var tweetText = this.getMetaContent('twitter:description') + ' ' + this.getMetaContent('twitter:url');
        this.openPopup('https://twitter.com/intent/tweet?text=' + encodeURIComponent(tweetText), 'twitter');
      }
    }
  });
  app.windowLocation();
});