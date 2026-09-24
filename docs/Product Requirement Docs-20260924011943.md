# Product Requirement Docs

# FX Startup — Product Requirements

## 1\. Product Overview

The FX platform enables users to compare currency exchange rates across fintech and other exchange-rate platforms, providing transparent and actionable pricing information.

The platform should allow a user to select a source currency and a target currency, view current exchange rates, compare rates across providers, understand recent rate movements, and receive notifications when a preferred exchange rate becomes available.

## 2\. Core Requirements

### 2.1 Currency Selection
1. The user should be able to select a source currency.
2. The user should be able to select a target currency.
3. The selected currency pair (for example, GBP → NGN) should be clearly displayed.

### 2.2 Current Exchange Rate
1. The user should be able to view the current exchange rate for the selected currency pair.
2. The displayed rate should identify the provider/platform from which it was obtained.
3. The platform should display the timestamp or freshness of the rate where applicable.

### 2.3 Exchange Provider Comparison
1. The user should be able to select **View Other Exchanges**.
2. The platform should display exchange rates from multiple available providers for the selected currency pair.
3. Providers should be presented in a consistent format so users can easily compare their rates.
4. Where sufficient data is available, the platform should identify the top available rates.

### 2.4 Rate Trends
1. The user should be able to view a trend chart for the selected currency pair.
2. The initial version should support the previous 24 hours.
3. The chart should show how the exchange rate has changed over time.
4. The displayed period should be clearly labelled.

## 3\. Personalised Exchange-Rate Price Alerts

Users should be able to define a target exchange-rate range for a specific currency pair and receive a notification when the market reaches that range.

### 3.1 Alert Configuration
1. The user should be able to select a currency pair (for example, GBP → NGN).
2. The user should be able to specify a target exchange rate.
3. The user should be able to specify a **price range/tolerance** around the target rate (for example, NGN 2,000–2,050 per GBP).
4. The user should be able to choose whether the alert should trigger when:
    *   the rate enters the specified range; or
    *   the rate reaches or exceeds a specified threshold.
5. The user should be able to select the notification channel:
    *   WhatsApp
    *   Telegram
6. The user should be able to enable, disable, edit, or delete an alert.
7. The system should clearly show the active conditions for each alert.

### 3.2 Alert Trigger
1. The system should continuously evaluate available exchange-rate data against the user's configured conditions.
2. When a relevant provider's rate enters the user's configured range, the system should trigger the alert.
3. The alert should identify:
    *   Currency pair
    *   Current exchange rate
    *   Provider/exchange platform
    *   User's configured target/range
    *   Time the condition was detected
4. The system should avoid repeatedly notifying the user for the same unchanged condition. A new notification should be sent when the rate leaves the configured range and subsequently enters it again, subject to the user's notification settings.
5. If multiple providers satisfy the condition, the notification should include the relevant providers and their rates, with the best available rates highlighted where appropriate.

### 3.3 Notification Delivery
1. WhatsApp and Telegram should be supported as notification channels.
2. Users must explicitly connect/authorise the selected notification channel before alerts can be delivered.
3. The system should provide clear feedback when notification delivery succeeds or fails.
4. The user should be able to manage notification preferences and active alerts.

### 3.4 Example User Flow

**Example:** A user wants to exchange GBP to NGN and would like to know when the rate reaches NGN 2,000–2,050 per GBP.

1. User selects **GBP → NGN**.
2. User creates an exchange-rate alert.
3. User sets the preferred range to **NGN 2,000–2,050**.
4. User selects **Telegram** as the notification channel.
5. The system monitors available exchange rates.
6. When a provider's rate enters the configured range, the user receives a Telegram notification containing the provider, rate, currency pair, and alert condition.
7. If the rate remains within the range, the system does not repeatedly send the same alert.
8. If the rate leaves the range and later enters it again, the alert can trigger again.

## 4\. Initial Notification Requirement

For the initial product version, users should be able to configure an alert for a currency pair and receive a notification containing the **top 3 available provider rates** when their configured exchange-rate condition is met.

## 5\. Motivation / Reference Products

*   FXTech: [https://fxtech.io/](https://fxtech.io/)
*   Wise Currency Converter: [https://wise.com/gb/currency-converter/](https://wise.com/gb/currency-converter/)