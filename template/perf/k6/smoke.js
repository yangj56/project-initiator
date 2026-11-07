import http from "k6/http";
import { check } from "k6";

export const options = {
  vus: 1,
  iterations: 1,
};

export default function () {
  const base = __ENV.BASE_URL || "http://localhost:3000";
  const response = http.get(`${base}/`);
  check(response, { "status is 200": (result) => result.status === 200 });
}
