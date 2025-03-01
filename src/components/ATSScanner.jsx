import React, { useState } from "react";
import { motion } from "framer-motion";
import { Upload, FileText, Check, Award, BarChart2, Book } from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";
import { Progress } from "./ui/progress";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "./ui/tabs";

import * as pdfjs from "pdfjs-dist";
import getResponseForGivenPrompt from "../lib/gemini";

pdfjsLib.GlobalWorkerOptions.workerSrc = "/pdfjs/pdf.worker.min.mjs";

const ATSScanner = () => {
  const [jobDescription, setJobDescription] = useState("");
  const [resumeUploaded, setResumeUploaded] = useState(false);
  const [scanResults, setScanResults] = useState(null);
  const [activeTab, setActiveTab] = useState("scan");

  // Add these new state variables
  const [resumeText, setResumeText] = useState("");
  const [resumeFile, setResumeFile] = useState(null);
  const [isExtracting, setIsExtracting] = useState(false);



  const handleResumeUpload = async (e) => {
    console.log(e.target.files[0]);
    
    const file = e.target.files[0];
    if (!file) return;

    // Check if it's a PDF file
    if (file.type !== "application/pdf") {
      alert("Please upload a PDF file");
      return;
    }

    setResumeFile(file);
    setIsExtracting(true);

    try {
      // Read the file as ArrayBuffer
      const arrayBuffer = await file.arrayBuffer();
      // Load the PDF document
      const loadingTask = pdfjs.getDocument({ data: arrayBuffer });
      const pdf = await loadingTask.promise;

      let extractedText = "";

      // Extract text from each page
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        const pageText = textContent.items.map((item) => item.str).join(" ");
        extractedText += pageText + "\n";
      }

      setResumeText(extractedText);
      setResumeUploaded(true);

      // You can log the extracted text to verify
//
//       console.log("Extracted text:", extractedText);
    } catch (error) {
      console.error("Error extracting text from PDF:", error);
      alert("Error extracting text from the PDF. Please try again.");
    } finally {
      setIsExtracting(false);
    }
  };

  const handleScan = async() => {
    // Simulate scanning process
    if (jobDescription && resumeUploaded) {
      const response=await getResponseForGivenPrompt(jobDescription,resumeText)
      
      // Mock results - in a real app, this would come from actual processing
      
      console.log("Re",response,typeof response);
      setScanResults({
        matchPercentage: parseInt(response.match_score.percentage),
        missingSkills: response.missing_skills,
        keywordMatches: response.keyword_matches.count,
        strengths: response.keywords,
        matchMessage: response.match_score.message,
        keywordMessage: response.keyword_matches.message,
      });

      // setScanResults({
      //   matchPercentage: 78,
      //   missingSkills: ["Docker", "AWS Lambda", "GraphQL"],
      //   keywordMatches: 24,
      //   strengths: ["React", "TypeScript", "Node.js", "Express"],
      // });
      setActiveTab("results");
    }
  };



  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      {/* Navbar */}
      <motion.nav
        className="bg-white dark:bg-gray-950 border-b border-gray-200 dark:border-gray-800"
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <motion.div
            className="flex items-center gap-2 font-bold text-xl text-blue-600 dark:text-blue-400"
            whileHover={{ scale: 1.05 }}
          >
            <FileText className="w-6 h-6" />
            <span>ATS Scanner Pro</span>
          </motion.div>
          <div className="flex gap-4">
            <Button variant="outline" size="sm">
              Sign In
            </Button>
            <Button size="sm">Sign Up</Button>
          </div>
        </div>
      </motion.nav>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <h1 className="text-3xl font-bold text-center mb-2">
            Optimize Your Resume for ATS
          </h1>
          <p className="text-gray-600 dark:text-gray-400 text-center mb-8">
            Maximize your chances of getting an interview by ensuring your
            resume passes through Applicant Tracking Systems.
          </p>
        </motion.div>

        <Tabs
          defaultValue="scan"
          value={activeTab}
          onValueChange={setActiveTab}
          className="w-full"
        >
          <TabsList className="grid w-full grid-cols-2 mb-8">
         
            <TabsTrigger value="scan"  >Scan Resume</TabsTrigger>
           
         
            <TabsTrigger value="results" disabled={!scanResults}>
              Results
            </TabsTrigger>
          </TabsList>

          <TabsContent value="scan">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Job Description Section */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
              >
                <Card className="h-full">
                  <CardHeader>
                    <CardTitle>Job Description</CardTitle>
                    <CardDescription>
                      Paste the job description here to compare with your resume
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Textarea
                      placeholder="Paste job description here..."
                      className="min-h-64"
                      value={jobDescription}
                      onChange={(e) => setJobDescription(e.target.value)}
                    />
                  </CardContent>
                </Card>
              </motion.div>

              {/* Resume Upload Section */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
              >
                <Card className="h-full">
                  <CardHeader>
                    <CardTitle>Your Resume</CardTitle>
                    <CardDescription>
                      Upload your resume in PDF format
                    </CardDescription>
                  </CardHeader>
                  {/* <CardContent className="flex flex-col items-center justify-center h-64">
                    {!resumeUploaded ? (
                      <motion.div
                        className="border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg p-6 w-full h-full flex flex-col items-center justify-center"
                        whileHover={{ scale: 1.02, borderColor: "#3b82f6" }}
                      >
                        <Upload className="h-12 w-12 text-gray-400 mb-4" />
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                          Drag and drop your resume or click to browse
                        </p>

                        <input
                          type="file"
                          accept=".pdf"
                          id="resumeUpload"
                          onChange={handleResumeUpload}
                          className="hidden"
                        />
                        <label htmlFor="resumeUpload">
                          <Button
                            as="span"
                            variant="secondary"
                            size="sm"
                            // disabled={isExtracting}
                          >
                            {isExtracting
                              ? "Extracting text..."
                              : "Select File"}
                          </Button>
                        </label>
                      </motion.div>
                    ) : (
                      <motion.div
                        className="flex flex-col items-center justify-center h-full w-full"
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                      >
                        <div className="bg-green-100 dark:bg-green-900/30 p-4 rounded-full mb-4">
                          <Check className="h-8 w-8 text-green-600 dark:text-green-400" />
                        </div>
                        <p className="font-medium">
                          Resume uploaded successfully
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                          resume.pdf
                        </p>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setResumeUploaded(false)}
                        >
                          Change File
                        </Button>
                      </motion.div>
                    )}
                  </CardContent> */}
                        <div className="border-2 border-dashed border-gray-300 p-6 rounded-lg">
        <p className="mb-4">Upload your resume (PDF only)</p>
        
        <input 
          type="file" 
          accept=".pdf" 
          onChange={handleResumeUpload}
          className="block w-full text-sm text-gray-500
                     file:mr-4 file:py-2 file:px-4
                     file:rounded-md file:border-0
                     file:text-sm file:font-semibold
                     file:bg-blue-50 file:text-blue-700
                     hover:file:bg-blue-100"
        />
        
        {isExtracting && <p className="mt-2">Extracting text...</p>}
        {resumeUploaded && <p className="mt-2 text-green-600">Resume uploaded: {resumeFile?.name}</p>}
      </div>
                </Card>
              </motion.div>
            </div>

            {/* Scan Button */}
            <motion.div
              className="mt-6 flex justify-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.5 }}
            >
              <Button
                size="lg"
                //onClick={generateResults}
                onClick={handleScan}
                disabled={!jobDescription || !resumeUploaded}
                className="px-8"
              >
                <FileText className="mr-2 h-5 w-5" /> Scan Resume
              </Button>
            </motion.div>
          </TabsContent>

          <TabsContent value="results">
            {scanResults && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
              >
                {/* Match Score Card */}
                <Card className="mb-6">
                  <CardHeader>
                    <CardTitle>Match Score</CardTitle>
                    <CardDescription>
                      How well your resume matches the job description
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-col items-center">
                      <motion.div
                        className="relative w-48 h-48 mb-4"
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ delay: 0.2, duration: 0.5 }}
                      >
                        <div className="absolute inset-0 flex items-center justify-center">
                          <span className="text-5xl font-bold text-blue-600 dark:text-blue-400">
                            {scanResults.matchPercentage}%
                          </span>
                        </div>
                        <svg className="w-full h-full" viewBox="0 0 100 100">
                          <circle
                            cx="50"
                            cy="50"
                            r="45"
                            fill="none"
                            stroke="#e5e7eb"
                            strokeWidth="8"
                          />
                          <circle
                            cx="50"
                            cy="50"
                            r="45"
                            fill="none"
                            stroke="#3b82f6"
                            strokeWidth="8"
                            strokeDasharray={`${2 * Math.PI * 45}`}
                            strokeDashoffset={`${
                              2 *
                              Math.PI *
                              45 *
                              (1 - scanResults.matchPercentage / 100)
                            }`}
                            transform="rotate(-90 50 50)"
                            className="transition-all duration-1000 ease-in-out"
                          />
                        </svg>
                      </motion.div>
                      <p className="text-gray-600 dark:text-gray-400 text-center max-w-md">
                        {/* Your resume is a good match for this position. A few
                        improvements could increase your chances. */}
                        {scanResults.matchMessage}
                      </p>
                    </div>
                  </CardContent>
                </Card>

                {/* Analysis Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
                  {/* Missing Skills */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3, duration: 0.5 }}
                  >
                    <Card>
                      <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-lg">
                          Missing Skills
                        </CardTitle>
                        <Book className="h-5 w-5 text-orange-500" />
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                          Skills mentioned in the job description but not found
                          in your resume:
                        </p>
                        <div className="space-y-2">
                          {scanResults.missingSkills.map((skill, index) => (
                            <div key={index} className="flex items-center">
                              <div className="w-1 h-5 bg-orange-500 mr-2 rounded-full"></div>
                              <span>{skill}</span>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                      <CardFooter>
                        <Button variant="outline" size="sm" className="w-full">
                          Learn These Skills
                        </Button>
                      </CardFooter>
                    </Card>
                  </motion.div>

                  {/* Keyword Matches */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4, duration: 0.5 }}
                  >
                    <Card>
                      <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-lg">
                          Keyword Matches
                        </CardTitle>
                        <BarChart2 className="h-5 w-5 text-blue-500" />
                      </CardHeader>
                      <CardContent>
                        <div className="text-center mb-3">
                          <span className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                            {scanResults.keywordMatches}
                          </span>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            relevant keywords found
                          </p>
                        </div>
                        <Progress value={85} className="h-2 mb-4" />
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {/* Your resume includes many key terms from the job
                          description, which is excellent for ATS scanning.
                         */}
                         {scanResults.keywordMessage}
                        </p>
                      </CardContent>
                      <CardFooter>
                        <Button variant="outline" size="sm" className="w-full">
                          View All Keywords
                        </Button>
                      </CardFooter>
                    </Card>
                  </motion.div>

                  {/* Strengths */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5, duration: 0.5 }}
                  >
                    <Card>
                      <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-lg">
                          Your Strengths
                        </CardTitle>
                        <Award className="h-5 w-5 text-green-500" />
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                          Skills in your resume that align well with this job:
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {scanResults.strengths.map((skill, index) => (
                            <div
                              key={index}
                              className="bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 px-3 py-1 rounded-full text-sm"
                            >
                              {skill}
                            </div>
                          ))}
                        </div>
                      </CardContent>
                      <CardFooter>
                        <Button variant="outline" size="sm" className="w-full">
                          Highlight These Skills
                        </Button>
                      </CardFooter>
                    </Card>
                  </motion.div>
                </div>

                {/* Actions */}
                <motion.div
                  className="flex flex-wrap gap-4 justify-center"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6, duration: 0.5 }}
                >
                  <Button size="lg">Optimize My Resume</Button>
                  <Button variant="outline" size="lg">
                    Download Report
                  </Button>
                  <Button variant="secondary" size="lg">
                    Scan Another Resume
                  </Button>
                </motion.div>
              </motion.div>
            )}
          </TabsContent>
        </Tabs>
      </main>

      {/* Footer */}
      <footer className="mt-16 bg-white dark:bg-gray-950 border-t border-gray-200 dark:border-gray-800 py-8">
        <div className="container mx-auto px-4 text-center text-gray-600 dark:text-gray-400 text-sm">
          <p>© 2025 ATS Scanner Pro. All rights reserved.</p>
          <div className="flex justify-center gap-4 mt-4">
            <Button variant="ghost" size="sm">
              Privacy Policy
            </Button>
            <Button variant="ghost" size="sm">
              Terms of Service
            </Button>
            <Button variant="ghost" size="sm">
              Contact Us
            </Button>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default ATSScanner;
