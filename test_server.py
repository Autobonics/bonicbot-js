#!/usr/bin/env python3
"""
BonicBot WebSocket Server Simulator
Simulates a BonicBot robot for testing the TypeScript library
"""

import asyncio
import json
import logging
import uuid
import time
import random
import math
from datetime import datetime, timezone
from typing import Dict, List, Any, Optional
import websockets
from websockets import WebSocketServerProtocol

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class ServoSimulator:
    """Simulates a robot servo with realistic behavior"""
    
    def __init__(self, servo_id: str, name: str, min_angle: float, max_angle: float):
        self.id = servo_id
        self.name = name
        self.min_angle = min_angle
        self.max_angle = max_angle
        self.current_angle = 0.0
        self.target_angle = 0.0
        self.speed = 200.0
        self.load = 0.0
        self.temperature = 25.0 + random.uniform(-2, 2)
        self.has_error = False
        self.last_update = time.time()
    
    def set_target(self, angle: float, speed: float = 200.0):
        """Set target angle and speed"""
        self.target_angle = max(self.min_angle, min(self.max_angle, angle))
        self.speed = speed
        
        # Simulate load based on movement
        angle_diff = abs(self.target_angle - self.current_angle)
        self.load = min(95, 10 + angle_diff * 2)
        
        # Simulate temperature increase with movement
        self.temperature += random.uniform(0, 0.5) if angle_diff > 10 else 0
    
    def update(self) -> Dict[str, Any]:
        """Update servo state and return current readings"""
        now = time.time()
        dt = now - self.last_update
        self.last_update = now
        
        # Move towards target
        if abs(self.current_angle - self.target_angle) > 0.1:
            direction = 1 if self.target_angle > self.current_angle else -1
            movement = self.speed * dt * direction * 0.1  # Scale movement
            self.current_angle += movement
            
            # Clamp to target if close enough
            if abs(self.current_angle - self.target_angle) < 0.1:
                self.current_angle = self.target_angle
                self.load = max(0, self.load - dt * 10)  # Reduce load when stopped
        else:
            # Reduce load when not moving
            self.load = max(0, self.load - dt * 5)
        
        # Cool down over time
        self.temperature = max(25, self.temperature - dt * 0.1)
        
        # Add some random variation
        self.temperature += random.uniform(-0.1, 0.1)
        
        return {
            "id": self.id,
            "name": self.name,
            "feedbackAngle": round(self.current_angle, 1),
            "feedbackSpeed": 0.0 if abs(self.current_angle - self.target_angle) < 0.1 else self.speed,
            "load": round(self.load, 1),
            "temperature": round(self.temperature, 1),
            "hasError": self.has_error
        }

class BatterySimulator:
    """Simulates robot battery"""
    
    def __init__(self):
        self.voltage = 12.6
        self.current = 0.5
        self.soc = 85.0  # State of charge
        self.temperature = 28.0
        self.has_error = False
        self.error_message = ""
        self.last_update = time.time()
    
    def update(self) -> Dict[str, Any]:
        """Update battery state"""
        now = time.time()
        dt = now - self.last_update
        self.last_update = now
        
        # Slowly drain battery
        self.soc = max(0, self.soc - dt * 0.001)  # Very slow drain for demo
        
        # Update voltage based on SOC
        self.voltage = 10.8 + (self.soc / 100) * 1.8
        
        # Random current variation
        self.current = 0.3 + random.uniform(0, 0.4)
        
        # Temperature variation
        self.temperature = 27 + random.uniform(-1, 2)
        
        # Low battery error
        if self.soc < 10:
            self.has_error = True
            self.error_message = "Critical battery level"
        elif self.soc < 20:
            self.has_error = False
            self.error_message = ""
        
        return {
            "voltage": round(self.voltage, 1),
            "current": round(self.current, 2),
            "soc": round(self.soc, 1),
            "temperature": round(self.temperature, 1),
            "hasError": self.has_error,
            "errorMessage": self.error_message
        }

class DistanceSensorSimulator:
    """Simulates distance sensor"""
    
    def __init__(self):
        self.base_distance = 500  # 50cm
        self.last_update = time.time()
    
    def update(self) -> Dict[str, Any]:
        """Update distance reading with random variation"""
        # Simulate moving obstacles
        variation = math.sin(time.time() * 0.5) * 100  # Slow oscillation
        noise = random.uniform(-20, 20)  # Random noise
        
        distance = max(50, self.base_distance + variation + noise)  # Min 5cm
        
        return {
            "distance": round(distance, 1),
            "unit": "mm",
            "hasError": False
        }

class SequenceSimulator:
    """Simulates motion sequences"""
    
    def __init__(self):
        self.sequences = [
            {
                "id": "seq_001",
                "name": "greeting_wave",
                "description": "Friendly greeting with wave gesture",
                "stepCount": 8,
                "duration": 12.0,
                "isLoop": False,
                "createdAt": "2024-01-15T10:30:00Z",
                "componentUsage": {"head": True, "rightArm": True, "leftArm": False, "base": False}
            },
            {
                "id": "seq_002", 
                "name": "look_around",
                "description": "Head scanning movement",
                "stepCount": 6,
                "duration": 8.0,
                "isLoop": False,
                "createdAt": "2024-01-15T11:00:00Z",
                "componentUsage": {"head": True, "rightArm": False, "leftArm": False, "base": False}
            },
            {
                "id": "seq_003",
                "name": "dance_basic",
                "description": "Simple dance routine",
                "stepCount": 16,
                "duration": 25.0,
                "isLoop": True,
                "createdAt": "2024-01-15T11:30:00Z",
                "componentUsage": {"head": True, "rightArm": True, "leftArm": True, "base": False}
            }
        ]
        
        self.current_sequence = None
        self.is_playing = False
        self.is_paused = False
        self.current_step = 0
        self.total_steps = 0
        self.playback_progress = 0.0
        self.start_time = 0
        self.sequence_duration = 0
    
    def start_sequence(self, name: str) -> bool:
        """Start playing a sequence"""
        sequence = next((s for s in self.sequences if s["name"] == name), None)
        if not sequence:
            return False
        
        self.current_sequence = name
        self.is_playing = True
        self.is_paused = False
        self.current_step = 0
        self.total_steps = sequence["stepCount"]
        self.playback_progress = 0.0
        self.start_time = time.time()
        self.sequence_duration = sequence["duration"]
        
        logger.info(f"Started sequence: {name}")
        return True
    
    def update(self) -> Dict[str, Any]:
        """Update sequence playback state"""
        if self.is_playing and not self.is_paused and self.current_sequence:
            elapsed = time.time() - self.start_time
            
            if elapsed >= self.sequence_duration:
                # Sequence completed
                self.is_playing = False
                self.current_sequence = None
                self.playback_progress = 1.0
                logger.info("Sequence completed")
            else:
                # Update progress
                self.playback_progress = elapsed / self.sequence_duration
                self.current_step = int(self.playback_progress * self.total_steps)
        
        return {
            "isPlaying": self.is_playing,
            "isPaused": self.is_paused,
            "isRecording": False,
            "currentSequence": self.current_sequence,
            "currentStep": self.current_step,
            "totalSteps": self.total_steps,
            "playbackProgress": round(self.playback_progress, 3),
            "availableSequenceCount": len(self.sequences)
        }
    
    def pause(self):
        """Pause sequence playback"""
        if self.is_playing:
            self.is_paused = True
    
    def resume(self):
        """Resume sequence playback"""
        if self.is_playing and self.is_paused:
            self.is_paused = False
    
    def stop(self):
        """Stop sequence playback"""
        self.is_playing = False
        self.is_paused = False
        self.current_sequence = None
        self.playback_progress = 0.0
    
    def jump_to_step(self, step: int):
        """Jump to specific step"""
        if 0 <= step < self.total_steps:
            self.current_step = step
            self.playback_progress = step / self.total_steps

class CameraSimulator:
    """Simulates camera system"""
    
    def __init__(self):
        self.is_streaming = False
        self.is_initialized = False
        self.connected_clients = 0
    
    def start_stream(self):
        """Start camera stream"""
        self.is_streaming = True
        self.is_initialized = True
        logger.info("Camera stream started")
    
    def stop_stream(self):
        """Stop camera stream"""
        self.is_streaming = False
        logger.info("Camera stream stopped")
    
    def capture_image(self) -> Dict[str, Any]:
        """Simulate image capture"""
        if not self.is_initialized:
            return None
        
        # Generate fake base64 image data (small 1x1 pixel PNG)
        fake_image_data = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg=="
        
        return {
            "imageData": fake_image_data,
            "format": "png",
            "timestamp": datetime.now(timezone.utc).isoformat()
        }
    
    def get_status(self) -> Dict[str, Any]:
        """Get camera status"""
        return {
            "isStreaming": self.is_streaming,
            "isInitialized": self.is_initialized,
            "connectedClients": self.connected_clients,
            "streamUrl": "ws://localhost:8080/camera" if self.is_streaming else None
        }

class BonicBotSimulator:
    """Main robot simulator"""
    
    def __init__(self):
        # Initialize servos with realistic limits
        self.servos = {
            # Head servos
            "headPan": ServoSimulator("headPan", "Head Pan", -90, 90),
            "headTilt": ServoSimulator("headTilt", "Head Tilt", -38, 45),
            
            # Right hand servos
            "rightGripper": ServoSimulator("rightGripper", "Right Gripper", -90, 90),
            "rightWrist": ServoSimulator("rightWrist", "Right Wrist", -90, 90),
            "rightElbow": ServoSimulator("rightElbow", "Right Elbow", -90, 0),
            "rightShoulderPitch": ServoSimulator("rightShoulderPitch", "Right Shoulder Pitch", -45, 180),
            "rightShoulderYaw": ServoSimulator("rightShoulderYaw", "Right Shoulder Yaw", -90, 90),
            "rightShoulderRoll": ServoSimulator("rightShoulderRoll", "Right Shoulder Roll", -3, 144),
            
            # Left hand servos
            "leftGripper": ServoSimulator("leftGripper", "Left Gripper", -90, 90),
            "leftWrist": ServoSimulator("leftWrist", "Left Wrist", -90, 90),
            "leftElbow": ServoSimulator("leftElbow", "Left Elbow", -90, 0),
            "leftShoulderPitch": ServoSimulator("leftShoulderPitch", "Left Shoulder Pitch", -45, 180),
            "leftShoulderYaw": ServoSimulator("leftShoulderYaw", "Left Shoulder Yaw", -90, 90),
            "leftShoulderRoll": ServoSimulator("leftShoulderRoll", "Left Shoulder Roll", -3, 144),
        }
        
        self.battery = BatterySimulator()
        self.distance_sensor = DistanceSensorSimulator()
        self.sequence_manager = SequenceSimulator()
        self.camera = CameraSimulator()
        
        self.is_connected = True
        self.streaming_subscriptions: Dict[str, float] = {}  # dataType -> interval
        
        # Base motors
        self.base_left_speed = 0.0
        self.base_right_speed = 0.0
    
    def get_servo_group_data(self, group: str) -> Dict[str, Any]:
        """Get servo data for a specific group"""
        group_mapping = {
            "head": ["headPan", "headTilt"],
            "righthand": ["rightGripper", "rightWrist", "rightElbow", "rightShoulderPitch", "rightShoulderYaw", "rightShoulderRoll"],
            "lefthand": ["leftGripper", "leftWrist", "leftElbow", "leftShoulderPitch", "leftShoulderYaw", "leftShoulderRoll"]
        }
        
        servo_ids = group_mapping.get(group, [])
        data = {}
        
        for servo_id in servo_ids:
            if servo_id in self.servos:
                servo_name = servo_id.replace("right", "").replace("left", "").replace("head", "") + "Servo"
                data[servo_name] = self.servos[servo_id].update()
        
        return data
    
    def get_base_data(self) -> Dict[str, Any]:
        """Get base motor data"""
        return {
            "leftMotor": {
                "id": "leftBase",
                "feedbackSpeed": self.base_left_speed + random.uniform(-2, 2),
                "feedbackPosition": random.randint(1000, 2000),
                "torque": abs(self.base_left_speed) * 0.5 + random.uniform(0, 5),
                "temperature": 30 + random.uniform(-2, 3),
                "mode": 1,
                "hasError": False
            },
            "rightMotor": {
                "id": "rightBase", 
                "feedbackSpeed": self.base_right_speed + random.uniform(-2, 2),
                "feedbackPosition": random.randint(1000, 2000),
                "torque": abs(self.base_right_speed) * 0.5 + random.uniform(0, 5),
                "temperature": 30 + random.uniform(-2, 3),
                "mode": 1,
                "hasError": False
            }
        }
    
    def process_servo_command(self, payload: Dict[str, Any]) -> Dict[str, Any]:
        """Process servo control command"""
        servo_id = payload.get("id")
        angle = payload.get("angle", 0)
        speed = payload.get("speed", 200)
        
        if servo_id in self.servos:
            self.servos[servo_id].set_target(angle, speed)
            logger.info(f"Servo {servo_id} set to {angle}° at speed {speed}")
            return {"success": True, "servoId": servo_id, "targetAngle": angle}
        else:
            return {"success": False, "error": f"Unknown servo: {servo_id}"}
    
    def process_head_command(self, payload: Dict[str, Any]) -> Dict[str, Any]:
        """Process head control command"""
        results = []
        
        if "pan" in payload:
            result = self.process_servo_command({"id": "headPan", "angle": payload["pan"], "speed": payload.get("speed", 200)})
            results.append(result)
        
        if "tilt" in payload:
            result = self.process_servo_command({"id": "headTilt", "angle": payload["tilt"], "speed": payload.get("speed", 200)})
            results.append(result)
        
        if "mode" in payload:
            mode = payload["mode"]
            logger.info(f"Head mode set to: {mode}")
            results.append({"success": True, "mode": mode})
        
        return {"success": True, "results": results}
    
    def process_base_command(self, payload: Dict[str, Any]) -> Dict[str, Any]:
        """Process base movement command"""
        left_motor = payload.get("leftMotor", {})
        right_motor = payload.get("rightMotor", {})
        
        self.base_left_speed = left_motor.get("currentSpeed", 0)
        self.base_right_speed = right_motor.get("currentSpeed", 0)
        
        logger.info(f"Base motors: left={self.base_left_speed}, right={self.base_right_speed}")
        
        return {
            "success": True,
            "leftMotorSpeed": self.base_left_speed,
            "rightMotorSpeed": self.base_right_speed
        }
    
    def process_speech_command(self, payload: Dict[str, Any]) -> Dict[str, Any]:
        """Process speech command"""
        text = payload.get("text", "")
        logger.info(f"Speaking: '{text}'")
        
        # Simulate speech duration
        speech_duration = len(text) * 0.1  # Rough estimate
        
        return {
            "success": True,
            "text": text,
            "estimatedDuration": speech_duration
        }
    
    def process_sequence_command(self, payload: Dict[str, Any]) -> Dict[str, Any]:
        """Process sequence command"""
        action = payload.get("action")
        
        if action == "list":
            return {
                "success": True,
                "sequences": self.sequence_manager.sequences
            }
        elif action == "play":
            name = payload.get("name")
            if name:
                success = self.sequence_manager.start_sequence(name)
                return {"success": success, "sequenceName": name}
            else:
                return {"success": False, "error": "Sequence name required"}
        elif action == "stop":
            self.sequence_manager.stop()
            return {"success": True}
        elif action == "pause":
            self.sequence_manager.pause()
            return {"success": True}
        elif action == "resume":
            self.sequence_manager.resume()
            return {"success": True}
        elif action == "jumpto":
            step = payload.get("step", 0)
            self.sequence_manager.jump_to_step(step)
            return {"success": True, "step": step}
        else:
            return {"success": False, "error": f"Unknown action: {action}"}
    
    def process_camera_command(self, payload: Dict[str, Any]) -> Dict[str, Any]:
        """Process camera command"""
        action = payload.get("action")
        
        if action == "start":
            self.camera.start_stream()
            return {"success": True}
        elif action == "stop":
            self.camera.stop_stream()
            return {"success": True}
        elif action == "capture":
            image_data = self.camera.capture_image()
            if image_data:
                return {"success": True, "imageData": image_data}
            else:
                return {"success": False, "error": "Camera not initialized"}
        elif action == "status":
            return {"success": True, "status": self.camera.get_status()}
        else:
            return {"success": False, "error": f"Unknown action: {action}"}

class WebSocketServer:
    """WebSocket server for BonicBot simulation"""
    
    def __init__(self, host="localhost", port=8080):
        self.host = host
        self.port = port
        self.robot = BonicBotSimulator()
        self.clients: Dict[str, WebSocketServerProtocol] = {}
        self.streaming_tasks: Dict[str, asyncio.Task] = {}
    
    async def register_client(self, websocket: WebSocketServerProtocol) -> str:
        """Register a new client"""
        client_id = str(uuid.uuid4())
        self.clients[client_id] = websocket
        
        # Send welcome message
        welcome_message = {
            "type": "welcome",
            "clientId": client_id,
            "robotStatus": {
                "isConnected": self.robot.is_connected,
                "batteryLevel": self.robot.battery.soc,
                "sequenceStatus": self.robot.sequence_manager.update(),
                "cameraStatus": self.robot.camera.get_status()
            }
        }
        
        await websocket.send(json.dumps(welcome_message))
        logger.info(f"Client {client_id} connected")
        return client_id
    
    async def unregister_client(self, client_id: str):
        """Unregister a client"""
        if client_id in self.clients:
            del self.clients[client_id]
            logger.info(f"Client {client_id} disconnected")
            
            # Stop streaming tasks for this client
            for task_key in list(self.streaming_tasks.keys()):
                if task_key.startswith(client_id):
                    self.streaming_tasks[task_key].cancel()
                    del self.streaming_tasks[task_key]
    
    async def handle_message(self, websocket: WebSocketServerProtocol, client_id: str, message: str):
        """Handle incoming message from client"""
        try:
            data = json.loads(message)
            command_type = data.get("commandType")
            data_type = data.get("dataType")
            payload = data.get("payload", {})
            interval = data.get("interval", 0)
            
            if command_type == "command":
                response = await self.handle_command(data_type, payload)
                await websocket.send(json.dumps({
                    "type": "response",
                    "success": response.get("success", False),
                    "commandType": "command",
                    "dataType": data_type,
                    "result": response,
                    "error": response.get("error") if not response.get("success", False) else None
                }))
            
            elif command_type == "request":
                if interval > 0:
                    # Start streaming
                    task_key = f"{client_id}_{data_type}"
                    if task_key not in self.streaming_tasks:
                        task = asyncio.create_task(
                            self.stream_sensor_data(websocket, client_id, data_type, interval)
                        )
                        self.streaming_tasks[task_key] = task
                        logger.info(f"Started streaming {data_type} for client {client_id}")
                else:
                    # Stop streaming
                    task_key = f"{client_id}_{data_type}"
                    if task_key in self.streaming_tasks:
                        self.streaming_tasks[task_key].cancel()
                        del self.streaming_tasks[task_key]
                        logger.info(f"Stopped streaming {data_type} for client {client_id}")
                
                # Send immediate response
                sensor_data = await self.get_sensor_data(data_type)
                await websocket.send(json.dumps({
                    "type": "response",
                    "success": True,
                    "commandType": "request",
                    "dataType": data_type,
                    "result": sensor_data
                }))
        
        except json.JSONDecodeError:
            logger.error(f"Invalid JSON from client {client_id}: {message}")
        except Exception as e:
            logger.error(f"Error handling message from {client_id}: {e}")
            await websocket.send(json.dumps({
                "type": "error",
                "error": str(e)
            }))
    
    async def handle_command(self, data_type: str, payload: Dict[str, Any]) -> Dict[str, Any]:
        """Handle command messages"""
        if data_type == "servo":
            return self.robot.process_servo_command(payload)
        elif data_type == "head":
            return self.robot.process_head_command(payload)
        elif data_type == "base":
            return self.robot.process_base_command(payload)
        elif data_type == "speak":
            return self.robot.process_speech_command(payload)
        elif data_type == "sequence":
            return self.robot.process_sequence_command(payload)
        elif data_type == "camera":
            return self.robot.process_camera_command(payload)
        else:
            return {"success": False, "error": f"Unknown command type: {data_type}"}
    
    async def get_sensor_data(self, data_type: str) -> Dict[str, Any]:
        """Get sensor data for specific type"""
        if data_type == "battery":
            return self.robot.battery.update()
        elif data_type in ["righthand", "lefthand", "head"]:
            return self.robot.get_servo_group_data(data_type)
        elif data_type == "base":
            return self.robot.get_base_data()
        elif data_type == "distance":
            return self.robot.distance_sensor.update()
        else:
            return {"error": f"Unknown sensor type: {data_type}"}
    
    async def stream_sensor_data(self, websocket: WebSocketServerProtocol, client_id: str, data_type: str, interval: float):
        """Stream sensor data to client"""
        try:
            while True:
                sensor_data = await self.get_sensor_data(data_type)
                message = {
                    "type": "continuousData",
                    "dataType": f"RobotDataType.{data_type}",
                    "data": sensor_data,
                    "timestamp": datetime.now(timezone.utc).isoformat()
                }
                
                await websocket.send(json.dumps(message))
                await asyncio.sleep(interval / 1000.0)  # Convert ms to seconds
        
        except asyncio.CancelledError:
            logger.info(f"Streaming {data_type} cancelled for client {client_id}")
        except Exception as e:
            logger.error(f"Error streaming {data_type} to {client_id}: {e}")
    
    async def broadcast_robot_updates(self):
        """Broadcast robot status updates to all clients"""
        while True:
            try:
                # Update sequence status
                sequence_status = self.robot.sequence_manager.update()
                
                # Send sequence updates if playing
                if sequence_status["isPlaying"] or sequence_status.get("currentSequence"):
                    update_message = {
                        "type": "sequenceUpdate",
                        "data": sequence_status
                    }
                    
                    # Send to all clients
                    disconnected_clients = []
                    for client_id, websocket in self.clients.items():
                        try:
                            await websocket.send(json.dumps(update_message))
                        except:
                            disconnected_clients.append(client_id)
                    
                    # Clean up disconnected clients
                    for client_id in disconnected_clients:
                        await self.unregister_client(client_id)
                
                await asyncio.sleep(0.5)  # Update every 500ms
                
            except Exception as e:
                logger.error(f"Error in broadcast updates: {e}")
                await asyncio.sleep(1)
    
    async def client_handler(self, websocket: WebSocketServerProtocol):
        """Handle individual client connection"""
        client_id = await self.register_client(websocket)
        
        try:
            async for message in websocket:
                await self.handle_message(websocket, client_id, message)
        except websockets.exceptions.ConnectionClosed:
            logger.info(f"Client {client_id} connection closed")
        finally:
            await self.unregister_client(client_id)
    
    async def start_server(self):
        """Start the WebSocket server"""
        logger.info(f"Starting BonicBot WebSocket server on {self.host}:{self.port}")
        
        # Start broadcast task
        broadcast_task = asyncio.create_task(self.broadcast_robot_updates())
        
        # Start WebSocket server
        server = await websockets.serve(self.client_handler, self.host, self.port)
        
        logger.info(f"BonicBot simulator running on ws://{self.host}:{self.port}")
        logger.info("Press Ctrl+C to stop")
        
        try:
            await server.wait_closed()
        finally:
            broadcast_task.cancel()

async def main():
    """Main entry point"""
    server = WebSocketServer("localhost", 8080)
    await server.start_server()

if __name__ == "__main__":
    try:
        asyncio.run(main())
    except KeyboardInterrupt:
        logger.info("Server stopped by user")