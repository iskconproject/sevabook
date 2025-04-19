import net from 'net';

/**
 * Send data to a network printer
 */
export function sendToPrinter(ip: string, port: number, data: Uint8Array): Promise<void> {
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

/**
 * Print data to a network printer
 */
export async function printToNetworkPrinter(ip: string, port: number, data: Uint8Array): Promise<{ success: boolean; error?: string }> {
  try {
    if (!ip || !port || !data) {
      return { success: false, error: 'Missing required parameters' };
    }

    // Send data to the printer
    await sendToPrinter(ip, port, data);
    return { success: true };
  } catch (error) {
    console.error('Error in print service:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to print' 
    };
  }
}
