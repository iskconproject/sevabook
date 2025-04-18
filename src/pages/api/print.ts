import { NextApiRequest, NextApiResponse } from 'next';
import net from 'net';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { ip, port, data } = req.body;

    if (!ip || !port || !data) {
      return res.status(400).json({ error: 'Missing required parameters' });
    }

    // Convert the array back to Uint8Array
    const printData = new Uint8Array(data);

    // Send data to the printer
    await sendToPrinter(ip, port, printData);

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error('Error in print API:', error);
    return res.status(500).json({ error: 'Failed to print' });
  }
}

/**
 * Send data to a network printer
 */
function sendToPrinter(ip: string, port: number, data: Uint8Array): Promise<void> {
  return new Promise((resolve, reject) => {
    const client = new net.Socket();
    
    client.connect(port, ip, () => {
      console.log(`Connected to printer at ${ip}:${port}`);
      
      // Send the data
      client.write(data, (err) => {
        if (err) {
          client.destroy();
          return reject(err);
        }
        
        // Close the connection
        client.end();
      });
    });

    client.on('close', () => {
      console.log('Connection closed');
      resolve();
    });

    client.on('error', (err) => {
      console.error('Socket error:', err);
      client.destroy();
      reject(err);
    });
  });
}
