const applications = [
  {
    id: "application-portal",
    name: "Application Portal",
    apiUrl: "http://localhost:5019",
    allowedPaths: ["/*"],
    roles: ["admin", "user"],
    options: {
      timeout: 60000,
      validateSession: true,
      retries: 1, // Add retry capability
    },
  },
  {
    id: "business-service",
    name: "Business Service",
    apiUrl: "http://localhost:3002",
    allowedPaths: ["/api/*"],
    roles: ["admin", "user", "manager"],
    options: {
      timeout: 600000,
      validateSession: true,
    },
  },
];

module.exports = applications;
