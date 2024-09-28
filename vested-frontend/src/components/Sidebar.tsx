// src/components/Sidebar.tsx

import React from "react";
import {
  Typography,
  Card,
  CardContent,
  Grid,
  Divider,
  Box,
  IconButton,
} from "@mui/material";
import RemoveIcon from "@mui/icons-material/Clear";
import styles from "../styles/Sidebar.module.css";
import { useNavigate } from "react-router-dom";
import { useGlobalState } from "../GlobalState";

const colorMapping: { [key: number]: string } = {
  0: "#ff6b6b",
  1: "#ff6b6b",
  2: "#ff6b6b",
  3: "#ff8c00",
  4: "#ff8c00",
  5: "#ffd700",
  6: "#ffd700",
  7: "#a8dd00",
  8: "#a8dd00",
  9: "#00AF4D",
  10: "#00AF4D",
};

const formatPrice = (price: number): string => {
  if (price >= 1000000) {
    return `$${(price / 1000000).toFixed(1)}M`; // Convert to millions and add 'M'
  } else if (price >= 1000) {
    return `$${(price / 1000).toFixed(1)}K`; // Convert to thousands and add 'K'
  } else {
    return `$${price}`; // Display as is if below 1000
  }
};

const Sidebar: React.FC = () => {
  const { state, removeStock } = useGlobalState();
  const { portfolioItems } = state;
  const navigate = useNavigate();

  console.log(portfolioItems);

  // Define categories
  const categories: Array<string> = ["Environmental", "Social", "Governance"];

  // Initialize total weighted scores and total amount invested
  const totalCategoryWeightedScores: { [key: string]: number } = {
    Environmental: 0,
    Social: 0,
    Governance: 0,
  };
  let totalAmountInvested = 0;

  // Iterate over portfolio items to accumulate weighted scores
  portfolioItems.forEach((item) => {
    // Calculate amount invested for the item
    // Assuming each item has an 'amountInvested' property
    // If not, calculate it using 'item.price * item.quantity' if 'quantity' exists
    const amountInvested = item.amountInvested
      ? item.amountInvested
      : item.price; // Replace with 'item.price * item.quantity' if applicable

    // Accumulate total amount invested
    totalAmountInvested += amountInvested;

    // Iterate over each category score in the item's options
    item.options.forEach((option: string, index: number) => {
      const extractedValue = parseFloat(option.split("/")[0]);
      if (!isNaN(extractedValue) && categories[index]) {
        totalCategoryWeightedScores[categories[index]] +=
          extractedValue * amountInvested;
      }
    });
  });

  // Calculate weighted average subScores
  const averageSubScores = categories.map((category) => ({
    category,
    score: totalAmountInvested
      ? parseFloat(
          (totalCategoryWeightedScores[category] / totalAmountInvested).toFixed(
            1
          )
        )
      : 0,
  }));

  // Calculate overall weighted score
  const overallScore = totalAmountInvested
    ? parseFloat(
        (
          categories.reduce(
            (acc, category) => acc + totalCategoryWeightedScores[category],
            0
          ) /
          (totalAmountInvested * categories.length)
        ).toFixed(1)
      )
    : 0;

  return (
    <Box className={styles.sidebar} onClick={() => navigate("/portfolio")}>
      <Box sx={{ mb: 2 }}>
        <Typography variant="h5" className={styles.title}>
          My Portfolio
        </Typography>
      </Box>
      <Box className={styles.portfolioList}>
        {portfolioItems.map((item, index) => (
          <Card
            key={index}
            className={styles.card}
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/info/${item.ticker}`, { state: { row: item } }); // Navigate to stock info
            }}
          >
            <CardContent className={styles.cardContent}>
              <Box className={styles.cardLine}>
                <Typography variant="body1" className={styles.ticker}>
                  {item.ticker.toUpperCase()}
                </Typography>
                <Typography variant="body2" className={styles.price}>
                  {formatPrice(item.price)} {/* Use the formatted price */}
                </Typography>
                <Box className={styles.options}>
                  {item.options.map(
                    (
                      option: string,
                      optionIndex: React.Key | null | undefined
                    ) => {
                      const extractedValue = parseInt(option.split("/")[0]);
                      const color = colorMapping[extractedValue] || "#cccccc";
                      return (
                        <Box
                          key={optionIndex}
                          className={styles.optionBox}
                          style={{
                            backgroundColor: color,
                            color: "#000",
                            padding: "4px 8px",
                            borderRadius: "4px",
                            display: "inline-block",
                          }}
                        >
                          {option.split("/")[0]}
                        </Box>
                      );
                    }
                  )}
                </Box>
                <IconButton
                  aria-controls={`menu-${item.ticker}`}
                  aria-haspopup="true"
                  onClick={(e) => {
                    e.stopPropagation(); // Prevent the event from propagating to the parent Box
                    removeStock(item.ticker);
                  }}
                >
                  <RemoveIcon sx={{ color: "#ff6b6b" }} />
                </IconButton>
              </Box>
            </CardContent>
          </Card>
        ))}
      </Box>

      {/* Footer Section */}
      <Divider className={styles.divider} />

      <Box className={styles.footer}>
        <Typography
          variant="h6"
          className={styles.footerTitle}
          style={{ marginBottom: "10px", color: "#555" }}
        >
          Portfolio Score
        </Typography>
        <Grid container spacing={2}>
          {/* Left Half: SubScores */}
          <Grid item xs={6}>
            <Box className={styles.subScores}>
              {averageSubScores.map((subScore, index) => (
                <Box key={index} className={styles.subScoreItem}>
                  {subScore.category === "Environmental" && (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="36"
                      height="32"
                      viewBox="0 0 36 32"
                      fill="none"
                    >
                      {/* SVG Path for Environmental */}
                      <path
                        d="M6.19235e-05 14.9364C-0.0116719 11.1016 1.64458 7.41054 4.62404 4.63151C7.60351 1.85247 11.6766 0.199587 15.9956 0.0169233C20.3145 -0.165741 24.5465 1.13589 27.8106 3.65086C31.0748 6.16583 33.1195 9.70038 33.5193 13.5188C32.6972 13.3227 31.867 13.1544 31.0304 13.0143C30.5326 10.1187 28.9277 7.4628 26.4847 5.4918C26.2423 5.87495 25.9255 6.35814 25.5631 6.87113C24.7519 8.02058 23.5878 9.5106 22.4238 10.2833C22.3832 10.3067 22.3468 10.3354 22.3158 10.3684C22.3158 10.4259 22.3398 10.5834 22.5198 10.9432C22.5998 11.1007 22.7038 11.2922 22.8318 11.5179C23.0478 11.9053 23.3166 12.3821 23.559 12.9121C22.7551 13.0191 21.961 13.1778 21.183 13.3868C21.0584 13.1477 20.9287 12.9107 20.7942 12.6758C20.6282 12.3871 20.4706 12.0947 20.3214 11.7989C20.1102 11.3731 19.8798 10.8197 19.9206 10.2322C19.9686 9.55105 20.3574 8.99761 20.9838 8.5804C21.7446 8.0738 22.7022 6.91371 23.5278 5.74084C23.9263 5.18102 24.2647 4.65525 24.5047 4.27211L24.5599 4.18271C22.2436 2.86403 19.5481 2.16494 16.7957 2.16904H16.6805C16.8989 2.55219 17.1389 3.00984 17.3549 3.51858C17.9405 4.89366 18.4685 6.90732 17.5253 8.68683C16.6589 10.3259 15.1636 10.7516 14.0452 11.007L13.8844 11.0432C12.7972 11.2922 12.3484 11.3944 12.022 11.8308C11.7195 12.2395 11.7748 12.7525 12.118 13.7465L12.1972 13.97C12.334 14.3574 12.4972 14.8172 12.5812 15.2515C12.6868 15.7921 12.7156 16.469 12.3316 17.1246C12.0057 17.7112 11.4846 18.1949 10.8387 18.5103C10.3393 18.737 9.80065 18.8881 9.24509 18.9574L9.08188 18.9829C8.22266 19.117 7.78585 19.1851 7.36584 19.5832C7.03703 19.8961 6.83303 20.4389 6.71543 21.2264C6.66903 21.5457 6.63302 21.8693 6.60742 22.1971L6.59062 22.3716C6.56384 22.7505 6.50852 23.1274 6.42502 23.4998L6.36502 23.7339C7.84949 25.121 9.66623 26.1947 11.6811 26.8758C11.2299 27.4718 10.8107 28.0877 10.4235 28.7234C7.34014 27.6014 4.70269 25.6915 2.84659 23.2365C0.990502 20.7814 -0.000348931 17.8923 6.19235e-05 14.9364ZM2.40012 14.9364C2.3958 17.156 3.04702 19.3378 4.28897 21.2648L4.33217 20.9455C4.46177 20.0834 4.73778 18.9595 5.609 18.1315C6.60502 17.1864 7.82425 17.0076 8.60427 16.8947L8.82508 16.8607C9.12425 16.8281 9.4158 16.7542 9.6891 16.6414C9.91659 16.5278 10.0961 16.3514 10.2003 16.1391C10.2363 16.0816 10.2795 15.9475 10.2147 15.6176C10.1383 15.2928 10.0405 14.9722 9.92191 14.6576L9.8211 14.3723C9.5091 13.4677 9.02188 11.9989 10.0155 10.6601C10.8795 9.4957 12.2692 9.19983 13.1692 9.00612L13.4428 8.94652C14.3956 8.72728 14.9596 8.5208 15.3508 7.78218C15.8621 6.82005 15.6388 5.5216 15.1084 4.26998C14.8291 3.61915 14.4837 2.99218 14.0764 2.39681C10.7906 2.95821 7.82776 4.51697 5.69698 6.8053C3.56621 9.09362 2.40049 11.9686 2.40012 14.9364ZM35.8209 16.5116C35.7137 16.357 35.5637 16.2293 35.3852 16.1407C35.2067 16.052 35.0055 16.0053 34.8009 16.005H34.7817L34.7193 15.9986L34.5009 15.9603C34.2601 15.9104 34.0209 15.855 33.7833 15.7942L33.5553 15.7389C32.8877 15.567 32.2146 15.4122 31.5368 15.2749C29.2148 14.8001 26.8168 14.6899 24.4519 14.9492C21.567 15.2685 19.3613 16.137 17.8565 17.3801C16.3445 18.6338 15.6004 20.226 15.6004 21.8501C15.602 22.2404 15.6324 22.6093 15.6916 22.957C18.2117 21.0072 21.3198 19.4299 24.7543 18.2102C24.9007 18.1582 25.0572 18.1323 25.2149 18.134C25.3726 18.1356 25.5283 18.1648 25.6733 18.2199C25.8183 18.2749 25.9496 18.3547 26.0598 18.4548C26.17 18.5549 26.2569 18.6732 26.3155 18.803C26.3741 18.9329 26.4033 19.0717 26.4015 19.2115C26.3996 19.3514 26.3667 19.4896 26.3046 19.6181C26.2426 19.7467 26.1526 19.8632 26.0397 19.9609C25.9269 20.0586 25.7935 20.1357 25.6471 20.1877C23.7342 20.8667 21.9654 21.65 20.3718 22.5334C16.4069 24.5854 13.9372 27.2206 12.1276 30.4305C12.0513 30.556 12.0042 30.6938 11.9891 30.8357C11.974 30.9776 11.9912 31.1207 12.0396 31.2566C12.0881 31.3925 12.1668 31.5184 12.2712 31.6268C12.3755 31.7352 12.5034 31.8239 12.6471 31.8876C12.7909 31.9514 12.9476 31.9889 13.108 31.9979C13.2684 32.0069 13.4292 31.9872 13.5808 31.9401C13.7325 31.8929 13.8719 31.8192 13.9909 31.7234C14.1098 31.6275 14.2058 31.5114 14.2732 31.382C15.1948 29.7515 16.2965 28.2849 17.7485 26.9801C17.7965 27.061 17.8525 27.1489 17.9165 27.244C18.1805 27.6399 18.5885 28.17 19.1453 28.7042C20.2614 29.7685 22.059 30.9052 24.6007 30.9052C26.1655 30.9052 27.4663 30.5519 28.532 29.9346C29.588 29.3258 30.3512 28.4978 30.9224 27.6293C31.8056 26.2883 32.3121 24.6918 32.6865 23.5083C32.7809 23.2089 32.8681 22.9414 32.9481 22.7058C33.3633 21.5053 33.9705 20.4282 34.5321 19.547C34.8185 19.1071 35.0785 18.7232 35.3121 18.3954L35.3505 18.3401C35.5378 18.0822 35.7123 17.8173 35.8737 17.5461C35.965 17.3839 36.008 17.2038 35.9988 17.0228C35.9895 16.8417 35.9283 16.6658 35.8209 16.5116Z"
                        fill="black"
                      />
                    </svg>
                  )}
                  {subScore.category === "Social" && (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="38"
                      height="32"
                      viewBox="0 0 38 32"
                      fill="none"
                    >
                      {/* SVG Path for Social */}
                      <path
                        fillRule="evenodd"
                        clipRule="evenodd"
                        d="M8.06061 11.8081C9.28221 11.8081 10.4538 11.3105 11.3176 10.4247C12.1814 9.53893 12.6667 8.33755 12.6667 7.08487C12.6667 5.83219 12.1814 4.63081 11.3176 3.74503C10.4538 2.85925 9.28221 2.36162 8.06061 2.36162C6.83901 2.36162 5.66744 2.85925 4.80363 3.74503C3.93983 4.63081 3.45455 5.83219 3.45455 7.08487C3.45455 8.33755 3.93983 9.53893 4.80363 10.4247C5.66744 11.3105 6.83901 11.8081 8.06061 11.8081ZM8.06061 14.1697C8.96793 14.1697 9.86636 13.9865 10.7046 13.6304C11.5429 13.2744 12.3045 12.7525 12.9461 12.0946C13.5876 11.4367 14.0966 10.6557 14.4438 9.79613C14.791 8.93656 14.9697 8.01527 14.9697 7.08487C14.9697 6.15447 14.791 5.23318 14.4438 4.37361C14.0966 3.51403 13.5876 2.733 12.9461 2.07511C12.3045 1.41722 11.5429 0.895352 10.7046 0.539304C9.86636 0.183256 8.96793 -1.3864e-08 8.06061 0C6.22821 2.79996e-08 4.47085 0.74644 3.17515 2.07511C1.87944 3.40378 1.15152 5.20585 1.15152 7.08487C1.15152 8.9639 1.87944 10.766 3.17515 12.0946C4.47085 13.4233 6.22821 14.1697 8.06061 14.1697Z"
                        fill="black"
                      />
                      <path
                        fillRule="evenodd"
                        clipRule="evenodd"
                        d="M5.42133 11.5625C5.52857 11.6722 5.61365 11.8025 5.6717 11.946C5.72975 12.0894 5.75963 12.2432 5.75963 12.3985C5.75963 12.5538 5.72975 12.7076 5.6717 12.8511C5.61365 12.9945 5.52857 13.1248 5.42133 13.2345L4.64291 14.0304C3.14487 15.567 2.30323 17.6507 2.30303 19.8235V24.2066C2.30303 24.5198 2.18171 24.8202 1.96576 25.0416C1.74981 25.263 1.45692 25.3874 1.15152 25.3874C0.846114 25.3874 0.553222 25.263 0.337271 25.0416C0.12132 24.8202 0 24.5198 0 24.2066V19.8235C0.000326476 17.0244 1.08469 14.3401 3.01467 12.3607L3.79079 11.5625C3.89775 11.4525 4.02482 11.3653 4.16472 11.3058C4.30462 11.2462 4.4546 11.2156 4.60606 11.2156C4.75752 11.2156 4.9075 11.2462 5.0474 11.3058C5.1873 11.3653 5.31437 11.4525 5.42133 11.5625ZM32.5787 10.854C32.4714 10.9637 32.3863 11.094 32.3283 11.2375C32.2702 11.3809 32.2404 11.5347 32.2404 11.69C32.2404 11.8454 32.2702 11.9991 32.3283 12.1426C32.3863 12.2861 32.4714 12.4164 32.5787 12.526L33.3571 13.3219C34.8551 14.8585 35.6968 16.9422 35.697 19.115V24.2066C35.697 24.5198 35.8183 24.8202 36.0342 25.0416C36.2502 25.263 36.5431 25.3874 36.8485 25.3874C37.1539 25.3874 37.4468 25.263 37.6627 25.0416C37.8787 24.8202 38 24.5198 38 24.2066V19.115C37.9997 16.3159 36.9153 13.6316 34.9853 11.6522L34.2092 10.854C34.1022 10.7441 33.9752 10.6568 33.8353 10.5973C33.6954 10.5378 33.5454 10.5071 33.3939 10.5071C33.2425 10.5071 33.0925 10.5378 32.9526 10.5973C32.8127 10.6568 32.6856 10.7441 32.5787 10.854Z"
                        fill="black"
                      />
                      <path
                        fillRule="evenodd"
                        clipRule="evenodd"
                        d="M28.7879 11.8081C27.5663 11.8081 26.3947 11.3105 25.5309 10.4247C24.6671 9.53893 24.1818 8.33755 24.1818 7.08487C24.1818 5.83219 24.6671 4.63081 25.5309 3.74503C26.3947 2.85925 27.5663 2.36162 28.7879 2.36162C30.0095 2.36162 31.1811 2.85925 32.0449 3.74503C32.9087 4.63081 33.394 5.83219 33.394 7.08487C33.394 8.33755 32.9087 9.53893 32.0449 10.4247C31.1811 11.3105 30.0095 11.8081 28.7879 11.8081ZM28.7879 14.1697C27.8806 14.1697 26.9821 13.9865 26.1439 13.6304C25.3056 13.2744 24.544 12.7525 23.9024 12.0946C23.2609 11.4367 22.7519 10.6557 22.4047 9.79613C22.0575 8.93656 21.8788 8.01527 21.8788 7.08487C21.8788 6.15447 22.0575 5.23318 22.4047 4.37361C22.7519 3.51403 23.2609 2.733 23.9024 2.07511C24.544 1.41722 25.3056 0.895352 26.1439 0.539304C26.9821 0.183256 27.8806 -1.3864e-08 28.7879 0C30.6203 2.79996e-08 32.3777 0.74644 33.6734 2.07511C34.9691 3.40378 35.697 5.20585 35.697 7.08487C35.697 8.9639 34.9691 10.766 33.6734 12.0946C32.3777 13.4233 30.6203 14.1697 28.7879 14.1697ZM18.4243 21.845C16.8973 21.845 15.4328 22.4671 14.353 23.5743C13.2733 24.6815 12.6667 26.1832 12.6667 27.7491V30.8192C12.6667 31.1324 12.5454 31.4327 12.3294 31.6541C12.1135 31.8756 11.8206 32 11.5152 32C11.2098 32 10.9169 31.8756 10.7009 31.6541C10.485 31.4327 10.3636 31.1324 10.3636 30.8192V27.7491C10.3636 25.5569 11.2129 23.4545 12.7245 21.9044C14.2362 20.3542 16.2864 19.4834 18.4243 19.4834C20.5621 19.4834 22.6123 20.3542 24.124 21.9044C25.6356 23.4545 26.4849 25.5569 26.4849 27.7491V30.8192C26.4849 31.1324 26.3635 31.4327 26.1476 31.6541C25.9316 31.8756 25.6387 32 25.3333 32C25.0279 32 24.7351 31.8756 24.5191 31.6541C24.3031 31.4327 24.1818 31.1324 24.1818 30.8192V27.7491C24.1818 26.9737 24.0329 26.206 23.7436 25.4897C23.4542 24.7734 23.0301 24.1225 22.4955 23.5743C21.9608 23.026 21.3261 22.5911 20.6276 22.2944C19.929 21.9977 19.1803 21.845 18.4243 21.845Z"
                        fill="black"
                      />
                      <path
                        fillRule="evenodd"
                        clipRule="evenodd"
                        d="M18.4242 18.3026C19.6458 18.3026 20.8174 17.805 21.6812 16.9192C22.545 16.0334 23.0303 14.832 23.0303 13.5793C23.0303 12.3266 22.545 11.1253 21.6812 10.2395C20.8174 9.35371 19.6458 8.85608 18.4242 8.85608C17.2026 8.85608 16.0311 9.35371 15.1673 10.2395C14.3034 11.1253 13.8182 12.3266 13.8182 13.5793C13.8182 14.832 14.3034 16.0334 15.1673 16.9192C16.0311 17.805 17.2026 18.3026 18.4242 18.3026ZM18.4242 20.6642C20.2566 20.6642 22.014 19.9178 23.3097 18.5891C24.6054 17.2604 25.3333 15.4584 25.3333 13.5793C25.3333 11.7003 24.6054 9.89824 23.3097 8.56957C22.014 7.2409 20.2566 6.49446 18.4242 6.49446C16.5918 6.49446 14.8345 7.2409 13.5388 8.56957C12.2431 9.89824 11.5151 11.7003 11.5151 13.5793C11.5151 15.4584 12.2431 17.2604 13.5388 18.5891C14.8345 19.9178 16.5918 20.6642 18.4242 20.6642Z"
                        fill="black"
                      />
                      <path
                        fillRule="evenodd"
                        clipRule="evenodd"
                        d="M18.4242 18.3026C19.6458 18.3026 20.8174 17.805 21.6812 16.9192C22.545 16.0334 23.0303 14.832 23.0303 13.5793C23.0303 12.3266 22.545 11.1253 21.6812 10.2395C20.8174 9.35371 19.6458 8.85608 18.4242 8.85608C17.2026 8.85608 16.0311 9.35371 15.1673 10.2395C14.3034 11.1253 13.8182 12.3266 13.8182 13.5793C13.8182 14.832 14.3034 16.0334 15.1673 16.9192C16.0311 17.805 17.2026 18.3026 18.4242 18.3026ZM18.4242 20.6642C20.2566 20.6642 22.014 19.9178 23.3097 18.5891C24.6054 17.2604 25.3333 15.4584 25.3333 13.5793C25.3333 11.7003 24.6054 9.89824 23.3097 8.56957C22.014 7.2409 20.2566 6.49446 18.4242 6.49446C16.5918 6.49446 14.8345 7.2409 13.5388 8.56957C12.2431 9.89824 11.5151 11.7003 11.5151 13.5793C11.5151 15.4584 12.2431 17.2604 13.5388 18.5891C14.8345 19.9178 16.5918 20.6642 18.4242 20.6642Z"
                        fill="black"
                      />
                    </svg>
                  )}
                  {subScore.category === "Governance" && (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="41"
                      height="32"
                      viewBox="0 0 41 32"
                      fill="none"
                    >
                      {/* SVG Path for Governance */}
                      <path
                        d="M38.952 5.64706C39.4746 5.64759 39.9772 5.8313 40.3572 6.16066C40.7372 6.49001 40.9658 6.94015 40.9965 7.4191C41.0271 7.89805 40.8574 8.36966 40.522 8.73757C40.1866 9.10548 39.7108 9.34192 39.1919 9.39859L38.952 9.41176V28.2353C39.4746 28.2358 39.9772 28.4195 40.3572 28.7489C40.7372 29.0782 40.9658 29.5284 40.9965 30.0073C41.0271 30.4863 40.8574 30.9579 40.522 31.3258C40.1866 31.6937 39.7108 31.9302 39.1919 31.9868L38.952 32H2.04796C1.52539 31.9995 1.02278 31.8158 0.642795 31.4864C0.262814 31.157 0.034151 30.7069 0.00352646 30.228C-0.027098 29.749 0.142628 29.2774 0.478025 28.9095C0.813422 28.5416 1.28918 28.3051 1.80808 28.2485L2.04796 28.2353V9.41176C1.52539 9.41123 1.02278 9.22752 0.642795 8.89817C0.262814 8.56881 0.034151 8.11868 0.00352646 7.63973C-0.027098 7.16078 0.142628 6.68917 0.478025 6.32126C0.813422 5.95335 1.28918 5.7169 1.80808 5.66024L2.04796 5.64706H38.952ZM34.8516 9.41176H6.14841V28.2353H10.2489V15.0588C10.2489 14.5596 10.4649 14.0808 10.8494 13.7278C11.2339 13.3748 11.7553 13.1765 12.2991 13.1765C12.8428 13.1765 13.3643 13.3748 13.7488 13.7278C14.1333 14.0808 14.3493 14.5596 14.3493 15.0588V28.2353H18.4498V15.0588C18.4498 14.5596 18.6658 14.0808 19.0503 13.7278C19.4348 13.3748 19.9562 13.1765 20.5 13.1765C21.0438 13.1765 21.5652 13.3748 21.9497 13.7278C22.3342 14.0808 22.5502 14.5596 22.5502 15.0588V28.2353H26.6507V15.0588C26.6507 14.5596 26.8667 14.0808 27.2512 13.7278C27.6357 13.3748 28.1572 13.1765 28.7009 13.1765C29.2447 13.1765 29.7661 13.3748 30.1506 13.7278C30.5351 14.0808 30.7511 14.5596 30.7511 15.0588V28.2353H34.8516V9.41176ZM32.8014 0C33.3451 0 33.8666 0.198319 34.2511 0.551329C34.6356 0.904338 34.8516 1.38312 34.8516 1.88235C34.8516 2.38158 34.6356 2.86037 34.2511 3.21338C33.8666 3.56639 33.3451 3.76471 32.8014 3.76471H8.19864C7.65488 3.76471 7.1334 3.56639 6.74891 3.21338C6.36442 2.86037 6.14841 2.38158 6.14841 1.88235C6.14841 1.38312 6.36442 0.904338 6.74891 0.551329C7.1334 0.198319 7.65488 0 8.19864 0H32.8014Z"
                        fill="black"
                      />
                    </svg>
                  )}
                  <Typography variant="h6" className={styles.scoreText}>
                    {subScore.score === 0 ? "-" : subScore.score} / 10
                  </Typography>
                </Box>
              ))}
            </Box>
          </Grid>

          {/* Right Half: Total Score */}
          <Grid item xs={6}>
            <Box
              className={styles.totalScore}
              sx={{
                borderRadius: "16px",
                boxShadow: "0 4px 8px rgba(0, 0, 0, 0.2)",
                alignItems: "center",
                justifyContent: "center",
                color: "#ffffff",
                maxWidth: "200px",
              }}
            >
              <Typography
                variant="h4"
                className={styles.footerNumber}
                sx={{
                  fontWeight: "bold",
                  fontSize: "2rem",
                }}
              >
                {overallScore === 0 ? "-" : overallScore} / 10
              </Typography>
            </Box>
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
};

export default Sidebar;
