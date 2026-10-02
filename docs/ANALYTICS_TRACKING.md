# Aventura request-journey analytics

This layer helps Aventura distinguish request journeys without sending guest PII to Google Analytics.

## Privacy boundary
Never send name, phone, email, free-text form values, or the booking reference. Session-only navigation/timing state is stored in `sessionStorage` as `aventura_journey_session_v1`, expires after 30 minutes of inactivity, and is cleared when analytics is disabled.

## Events
- `request_page_reached`: first arrival at `/contact.html`.
- `request_form_started`: first trusted form interaction.
- `request_type_selected`: request type selected.
- `request_channel_selected`: response/submission channel selected.
- `request_submit_attempt`: submit attempted.
- `request_completed`: request-success state reached.

## Journey patterns
`journey_pattern` is descriptive:
- `direct_to_request`: no earlier page in the measured session.
- `short_path_to_request`: one or two distinct earlier pages.
- `explored_before_request`: three or more distinct earlier pages.

Conan should combine the pattern with timing before describing a visitor as "ready to request" or "exploring".

## GA4 custom definitions
Register these in **Admin → Custom definitions**. Registration is not retroactive.

Event-scoped dimensions:
- `entry_path`
- `journey_pattern`
- `request_type`
- `request_channel`

Event-scoped metrics:
- `pages_before_contact`
- `unique_pages_before_contact`
- `session_page_count`
- `seconds_to_contact`
- `seconds_to_form_start`
- `seconds_to_type_select`
- `seconds_to_channel_select`
- `seconds_to_submit`
- `seconds_in_form`
- `seconds_to_completion`

Do not hard-code a "fast" threshold until Aventura has enough real requests to establish a baseline.
