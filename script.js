(function () {

  const ucCategories_readable_mapping = {
    'marketing' : 'analytische_cookies',
    'functional' : 'jobadvertenties',
    'customCategory-324b53ce-b4b9-4799-83c2-d61264f03d04' :'dienstverlening',
  }

  if (document.readyState !== 'loading') {
    console.log('not loading');
    initConsentScript();
  } else {
    document.addEventListener('DOMContentLoaded', function () {
        console.log('DOMContentLoaded');
      initConsentScript();
    });
  }

  function initConsentScript() {
    // ucConsentEvent Event Listener. When consent gets updated, we save the consent to a readable local_storage 'vdab_gcm'
    // and push consent values to GTM using gtag().
    window.addEventListener("ucConsentEvent", function (e) {
        console.log('ucConsentEvent');
      window.dataLayer = window.dataLayer || [];
      if (e.detail && e.detail.event == "consent_status") {
        const readable_categories = getReadableCategories(e);

        // vdab_gcm cookie update
        setCookie('vdab_gcm', JSON.stringify(readable_categories), 100);

        // GCM updates.
        // Functionality storage
        if(readable_categories.hasOwnProperty("jobadvertenties")) {
          gtag("consent", "update", {
            functionality_storage: readable_categories["jobadvertenties"],
          });
        }

        // Analytics storage
        if(readable_categories.hasOwnProperty("analytische_cookies")) {
          gtag("consent", "update", {
            analytics_storage: readable_categories['analytische_cookies'],
          });
        }

        // Personalization storage
        if (readable_categories.hasOwnProperty("dienstverlening")) {
          gtag("consent", "update", {
            personalization_storage: readable_categories['dienstverlening'],
          });
        }

        // Send a custom event Tagmanager can use as a trigger.
        // It is a signal consent updates are finished.
        gtag('event', 'consent_update_finished');

        // Dispatch a custom 'vdab_consent_updated' JS event to signal that the
        // consent was updated.
        let event = new CustomEvent('vdab_consent_updated', {
          detail: readable_categories
        });
        document.dispatchEvent(event);
      }
    });
  }

  function gtag() {
    console.log('gtag', arguments);
    dataLayer.push(arguments);
  }

  function getReadableCategories(e) {
    let ucCategories_object = {};
    if(e.detail.ucCategory) {
      let ucCategories_json = JSON.stringify(e.detail.ucCategory);
      ucCategories_object = JSON.parse(ucCategories_json);
    }

    let ucCategories_readable = {};
    for(const key in ucCategories_readable_mapping) {
      if(ucCategories_readable_mapping.hasOwnProperty(key) && ucCategories_object.hasOwnProperty(key)) {
        ucCategories_readable[ucCategories_readable_mapping[key]] = ucCategories_object[key] ? 'granted' : 'denied';
      }
    }

    return ucCategories_readable;
  }

  function setCookie(name, value, days) {
    let expires = '';
    if (days) {
      const date = new Date();
      date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
      expires = `; expires=${date.toUTCString()}`;
    }

    document.cookie = `${name}=${value}${expires}; path=/; domain=.vdab.be`;
  }

}());