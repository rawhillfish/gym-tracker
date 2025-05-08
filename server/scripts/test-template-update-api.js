require('dotenv').config();
const fetch = require('node-fetch');

const testTemplateUpdateApi = async (token, templateId) => {
  try {
    console.log(`Testing template update API for template ID: ${templateId}`);
    
    // First, get the template
    const getResponse = await fetch(`http://localhost:5000/api/workout-templates/${templateId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (!getResponse.ok) {
      console.error(`Error getting template: ${getResponse.status}`);
      const errorData = await getResponse.json();
      console.error('Error data:', errorData);
      return;
    }
    
    const template = await getResponse.json();
    console.log('Original template:', JSON.stringify(template, null, 2));
    
    // Modify the template description
    template.description = `${template.description} (Updated via API test at ${new Date().toISOString()})`;
    
    // Update the template
    const updateResponse = await fetch(`http://localhost:5000/api/workout-templates/${templateId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(template)
    });
    
    console.log('Update response status:', updateResponse.status);
    
    const updateData = await updateResponse.json();
    console.log('Update response data:', JSON.stringify(updateData, null, 2));
    
  } catch (error) {
    console.error('Error testing template update API:', error);
  }
};

// Get token and template ID from command line arguments
const token = process.argv[2];
const templateId = process.argv[3];

if (!token || !templateId) {
  console.error('Please provide both token and template ID as arguments');
  console.log('Usage: node test-template-update-api.js <token> <templateId>');
  process.exit(1);
}

testTemplateUpdateApi(token, templateId);
