class MapsController < ApplicationController
  before_action :set_map, only: [:destroy]
  respond_to :json
  require 'uri'

  # GET /maps
  # GET /maps.json
  def index
    @maps = Map.order("id DESC").all
  end

  def location
  end

  def near
  end
  
  # POST /maps
  # POST /maps.json
  def create
    @map = Map.new(map_params)

    respond_to do |format|
      if @map.save
        format.html { redirect_to maps_url }
        format.json { head :no_content }
      else
        format.html { redirect_to maps_url }
        format.json { render json: @map.errors, status: :unprocessable_entity }
      end
    end
  end

  # DELETE /maps/1
  # DELETE /maps/1.json
  def destroy
    @map.destroy
    respond_to do |format|
      format.html { redirect_to maps_url }
      format.js { render :nothing => true }
    end
  end

  private
    # Use callbacks to share common setup or constraints between actions.
    def set_map
      @map = Map.find(params[:id])
    end

    # Never trust parameters from the scary internet, only allow the white list through.
    def map_params
      params.require(:map).permit(:latitude, :longitude, :name, :formatted_address, :formatted_phone_number, :rating, :url, :website, :map_ref, :photos_url)
    end
end