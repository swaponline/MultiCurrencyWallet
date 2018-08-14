import React from "react";

const JsonLd = ({ url, title, description }) => (
  <script
    type="application/ld+json"
    dangerouslySetInnerHTML={
      {
        __html: JSON.stringify({
          "@context": "http://schema.org",
          "@type": "Website",
          sameAs: [
            "https://medium.com/@swaponline",
            "https://twitter.com/SwapOnlineTeam",
            "https://www.facebook.com/SwapOnlineTeam/",
            "https://t.me/swaponlineint"
          ],
          email: "info@swap.online",
          url: `https://${url}`,
          name: title,
          description: description,
          logo: "https://wiki.swap.online/wp-content/uploads/2018/04/logo-1.png"
        })
    }}
  />
)

export default JsonLd