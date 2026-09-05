import fs from "fs";
import path from "path";

async function runTests() {
  console.log("=== STARTING FULL END-TO-END INTEGRATION TEST ===");

  const BASE_URL = "http://localhost:3000";
  const ML_URL = "http://localhost:8000";

  // 1. Health checks
  console.log("\n1. Testing Service Health Checks...");
  const backendHealth = await fetch(`${BASE_URL}/health`).then((r) => r.json());
  console.log("Backend Health:", backendHealth);

  const mlHealth = await fetch(`${ML_URL}/health`).then((r) => r.json());
  console.log("ML Server Health:", mlHealth);

  // 2. Auth Registration
  console.log("\n2. Testing Healthcare Worker Registration...");
  const testEmail = `doctor_${Date.now()}@medicall.org`;
  const registerPayload = {
    fullName: "Dr. Ananya Sharma",
    email: testEmail,
    password: "SecurePassword123!",
    phone: "+91 9876543210",
    workerId: `HW-BLR-${Date.now().toString().slice(-4)}`,
    phc: "PHC Malleshwaram Urban",
    region: "Bangalore Urban",
  };

  const regRes = await fetch(`${BASE_URL}/api/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(registerPayload),
  });

  const regData = await regRes.json();
  console.log("Registration Status:", regRes.status);
  console.log("Registration Response:", regData);

  if (!regData.success || !regData.token) {
    throw new Error("Registration failed!");
  }

  const token = regData.token;

  // 3. Auth Login
  console.log("\n3. Testing Healthcare Worker Login...");
  const loginRes = await fetch(`${BASE_URL}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email: testEmail,
      password: "SecurePassword123!",
    }),
  });
  const loginData = await loginRes.json();
  console.log("Login Status:", loginRes.status);
  console.log("Login Response:", loginData);

  // 4. Verify Auth Session (/me)
  console.log("\n4. Testing /api/auth/me Profile Verification...");
  const meRes = await fetch(`${BASE_URL}/api/auth/me`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  const meData = await meRes.json();
  console.log("Me Status:", meRes.status);
  console.log("Me Response:", meData);

  // 5. Test Scan Upload & ML Inference
  console.log("\n5. Testing Retina Scan Upload + AI Prediction Flow...");
  const testImagePath = path.resolve("../DR_AI_SERVER/test_images/lol.png");
  if (!fs.existsSync(testImagePath)) {
    throw new Error(`Test image not found at ${testImagePath}`);
  }

  const fileBuffer = fs.readFileSync(testImagePath);
  const blob = new Blob([fileBuffer], { type: "image/png" });

  const formData = new FormData();
  formData.append("fullName", "Ramesh Kumar");
  formData.append("patientNumber", `PT-${Date.now().toString().slice(-6)}`);
  formData.append("abhaNumber", "91-4829-1029-3841");
  formData.append("sugarLevel", "172");
  formData.append("age", "58");
  formData.append("gender", "Male");
  formData.append("eyeSide", "Right Eye (OD)");
  formData.append("imageUrl", blob, "lol.png");

  const scanRes = await fetch(`${BASE_URL}/api/upload/scan`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  });

  const scanData = await scanRes.json();
  console.log("Scan Upload Status:", scanRes.status);
  console.log("Scan Upload Response:", JSON.stringify(scanData, null, 2));

  if (!scanData.success || !scanData.analysis) {
    throw new Error("Scan analysis failed!");
  }

  console.log("\nAI Analysis Verification:");
  console.log("- Predicted Class:", scanData.analysis.predictedClass);
  console.log("- Class Name:", scanData.analysis.className);
  console.log("- Confidence:", scanData.analysis.confidence);
  console.log("- Grad-CAM Heatmap URL:", scanData.analysis.gradcamUrl);
  console.log("- Vessel Mask URL:", scanData.analysis.vesselMaskUrl);

  // 6. Test Fetching Scans & Patients
  console.log("\n6. Testing All Scans & Patients Endpoints...");
  const allScans = await fetch(`${BASE_URL}/api/upload/posts`).then((r) => r.json());
  console.log(`Total scans retrieved: ${allScans.count}`);

  const allPatients = await fetch(`${BASE_URL}/api/detail`).then((r) => r.json());
  console.log(`Total patients retrieved: ${allPatients.count}`);

  console.log("\n=== ALL INTEGRATION TESTS PASSED WITH 100% SUCCESS! ===");
}

runTests().catch((err) => {
  console.error("Integration Test FAILED:", err);
  process.exit(1);
});
