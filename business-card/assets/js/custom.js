
$("#exchangeDataShareLink").click(function(){
    $("#overlay").fadeIn()
    $('#shareLinkModal').slideDown()
})



let cardImages = {}

function openImage(imageId, linkId, indexParam) {
    const IMAGES = cardImages[`${linkId}-${indexParam}`]
    callLinkViewd(linkId)
    const index = IMAGES.findIndex(image => image.id == imageId);
    if (index !== -1) {
        const [imageObject] = IMAGES.splice(index, 1);
        IMAGES.unshift(imageObject);
    }

    $('#emailModal').hide()
    $('#mobileModal').hide()
    $("#overlay, #previewImage").fadeIn()
    const linkImages = IMAGES.map(image => `
        <div class="swiper-slide">
            <img src="${image.image}" alt="Image">
        </div>
    `).join('');

    const imageSwiperHTML = `
        <div class="swiper swiper-card" id="swiper-card">
            <div class="swiper-wrapper">${linkImages}</div>
        </div>`

        const swiperElement = $(imageSwiperHTML);

        $("#previewImage").empty()

        swiperElement.appendTo("#previewImage");
    
        const swiper = new Swiper(`#swiper-card`, {
            effect: "cards",
            grabCursor: true,
    });
}

    
    
function profileLayout(id, is_pro, is_pro_plus) {
    if(id == 8 && (is_pro || is_pro_plus)) $("#mobile").addClass("mobile-option-2")
    else if (id == 7 && (is_pro || is_pro_plus)) $("#mobile").addClass("mobile-option-2").addClass("mobile-option-3")
}

function downloadToFile(content, filename, contentType) {
    const a = document.createElement('a');
    const file = new Blob([content], { type: contentType });
  
    a.href = URL.createObjectURL(file);
    a.download = filename;
    a.click();
  
    URL.revokeObjectURL(a.href);
}
let modal = document.getElementById('modal')
let modalText = document.getElementById('modal-text')

function showModal (value) {
    $("#overlay").fadeIn()
    $('#modal').hide()
    if (value == 1) {
        $('#emailModal').hide()
    	$('#mobileModal').slideDown();
    }else {
        $('#mobileModal').hide()
        $('#emailModal').slideDown()
    }
    
}

function openLinkInBrowser(url) {
    if (navigator && navigator.app && navigator.app.loadUrl) {
        navigator.app.loadUrl(url, { openExternal:true });
    } else {
        window.open(url, '_system');
    }
}

$("#overlay").click(function(event) {
    hideOverlay(event)
})

$("#exchangeDataButton").click(function() {
    $("#overlay").fadeIn()
    $('#modal').slideDown();
    $('#modal').show();
})

function hideOverlay(event) {
    if ($(event.target).closest('#modal').length) {
        event.preventDefault(); // Prevent default action if event target is within #shareLinkModal
    }
    if (!$(event.target).closest('#modal').length && !$(event.target).closest('#shareLinkModal').length && !$(event.target).closest('#previewImage').length) {
        $("#overlay, #previewImage").fadeOut()
        $("#modal, #shareLinkModal").slideUp();
    }
}



$('#cancel-btn').click(function(){
    $("#overlay").fadeOut()
    $('#modal').slideUp()
})
const keyParams = new URLSearchParams(window.location.search).get('key');
const profileIdParams = new URLSearchParams(window.location.search).get('profileID');
const productIdParams = new URLSearchParams(window.location.search).get('productID');

let path = window.location.pathname
let myPortion = path.split('/').slice(1);
myPortion = myPortion[myPortion.length - 1]

let profileId = profileIdParams ? profileIdParams : -1;
let productId = productIdParams ? productIdParams : -1;

function getKey() {
  function random(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  let key = '';
  if (username !== '') {
    key = username;
  } else if (profileId > 0 || productId > 0) {
    let id = profileId > 0 ? profileId : productId;
    id = (parseInt(id) + 55437895) * 46100133;
    key = id.toString();
    let type = profileId > 0 ? random(1, 3) : random(4, 6);
    key = `${key.substring(0, 12)}${type}${key.substring(12)}`;
  } else if (keyParams) {
    key = keyParams
  }
  return key;
}

// loadData(getKey()).then(res => {
//     let contactTitle = document.getElementById('contact-title')
//     contactTitle.innerHTML = `<img src="${res.image}" alt="Profile image">Exchange your info with ${res.fullName}!`
//     window.history.replaceState("", "", username);
// })


function makeConnection(profile_id,connected_profile_id) {
    $.ajax({
        url: contactWithUrl,
        type: 'POST',
        data: JSON.stringify({ 
            profile_id: profile_id, 
            connected_profile_id: connected_profile_id 
        }),
        dataType: 'json',
        contentType: 'application/json',
        success: function(response) {
            $('#save-contact_v2').css('background-color', '#25D366');
            $('#save-contact_v2').text('Connected successfully');
            $('#save-contact_v2').prop('disabled', true);  
        },
        error: function(xhr, status, error) {
            console.error('Error:', xhr.responseText);
        }
    });
}



$('#copyButton').on('click', function() {
    var text = $('#share-link-modal-copy-link-text').text();
    copyTextToClipboard(text)
});


function copyTextToClipboard(text) {
    var $tempInput = $('<input>');
    $('body').append($tempInput);
    $tempInput.val(text).select();
    document.execCommand('copy');
    $tempInput.remove();
    $("#alert-success-message").html("Text copied")
    $("#alert-success-message").fadeIn()
    $("#alert-success-message").delay(1000).fadeOut()
}

let viaLinks = [
    {src: "facebook.png", alt: "Facebook", title: "Facebook", method: "shareOnFacebook"},
    {src: "linkdin.png", alt: "LinkdIn", title: "LinkdIn", method: "shareOnLinkedIn"},
    {src: "twiiter.png", alt: "Twiiter", title: "Twiiter", method: "shareOnTwitter"},
    {src: "whatsapp.png", alt: "Whatsapp", title: "Whatsapp", method: "shareOnWhatsApp"},
    {src: "mail.png", alt: "Mail", title: "Mail", method: "shareViaEmail"},
]

function appendLinksArray(linkProfile) {
    let links = [];
    viaLinks.forEach(link => {
        links += `<div class="share-link-modal-box-links-img" onclick="${link.method}('${linkProfile}')">
                    <img src="./images/${link.src}" alt="${link.alt}" title="${link.title}">
                  </div>`
    });
    $("#share-link-modal-box-links").html(links);
}

function shareOnFacebook(link) {
    const url = encodeURIComponent(link); // Replace with your website URL
    const facebookShareUrl = `https://www.facebook.com/sharer/sharer.php?u=${url}`;
    window.open(facebookShareUrl, '_blank');
}
function shareOnWhatsApp(link) {
    const url = encodeURIComponent(link); // Replace with your website URL
    const whatsappShareUrl = `https://api.whatsapp.com/send?text=${url}`;
    window.open(whatsappShareUrl, '_blank');
}
function shareOnLinkedIn(link) {
    const url = encodeURIComponent(link); // Replace with your website URL
    const linkedinShareUrl = `https://www.linkedin.com/shareArticle?url=${url}`;
    window.open(linkedinShareUrl, '_blank');
}
function shareViaEmail(link) {
    const url = encodeURIComponent(link); // Replace with your website URL
    const subject = encodeURIComponent('Check out this link');
    const body = encodeURIComponent(`I thought you might find this interesting: ${url}`);
    const mailtoUrl = `mailto:?subject=${subject}&body=${body}`;
    window.location.href = mailtoUrl;
}
function shareOnTwitter(link) {
    const url = encodeURIComponent(link); // Replace with your website URL
    const text = encodeURIComponent('Check out this link:');
    const twitterShareUrl = `https://twitter.com/intent/tweet?text=${text}&url=${url}`;
    window.open(twitterShareUrl, '_blank');
}

function importDarkMode() {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = darkModeSource;
    document.head.appendChild(link);
}

function addOpenGraphMetaTags(title, description, image) {
    var head = document.getElementsByTagName('head')[0];

    // Remove existing Open Graph meta tags
    var existingTags = document.querySelectorAll('meta[property^="og:"]');
    existingTags.forEach(tag => tag.remove());

    // Add new Open Graph meta tags
    var ogTitle = document.createElement('meta');
    ogTitle.setAttribute('property', 'og:title');
    ogTitle.setAttribute('content', title);
    head.appendChild(ogTitle);

    var ogDescription = document.createElement('meta');
    ogDescription.setAttribute('property', 'og:description');
    ogDescription.setAttribute('content', description);
    head.appendChild(ogDescription);

    var ogImage = document.createElement('meta');
    ogImage.setAttribute('property', 'og:image');
    ogImage.setAttribute('content', image);
    head.appendChild(ogImage);
}