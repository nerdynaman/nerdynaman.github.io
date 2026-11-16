# Use Alpine as the base image
FROM ubuntu:latest

# Update the package list and install Tor
RUN apt update && apt install -y tor

# create base dir for tor relay
RUN mkdir /torDir

# Start Tor
CMD ["tor"]
