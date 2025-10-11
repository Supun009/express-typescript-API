import axios from "axios";

// Make sure your server is running before executing this script

const TARGET_URL = "http://localhost:3000/"; // Change to a valid endpoint in your app
const REQUEST_COUNT = 105; // A few more than your rate limit of 100

async function testRateLimiter() {
  console.log(
    `Starting rate limiter test: sending ${REQUEST_COUNT} requests to ${TARGET_URL}`,
  );

  const promises = [];

  for (let i = 1; i <= REQUEST_COUNT; i++) {
    const promise = axios
      .get(TARGET_URL)
      .then((response) => {
        console.log(`Request #${i}: Success (${response.status})`);
      })
      .catch((error) => {
        if (error.response) {
          console.error(
            `Request #${i}: Failed with status ${error.response.status} - "${error.response.data}"`,
          );
        } else {
          console.error(`Request #${i}: Failed with error: ${error.message}`);
        }
      });
    promises.push(promise);
  }

  await Promise.all(promises);
  console.log("\nRate limiter test finished.");
}

testRateLimiter();
